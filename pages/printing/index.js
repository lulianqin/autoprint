const app = getApp();
Page({
    data: {
    },
    onLoad: function (options) {

    },
    onShow: function () {
        let p1 = new Promise((resolve, reject) => {
            wx.getStorage({
                key: 'printer',
                success: res => {
                    this.setData({
                        printer: res.data,
                        api: app.api
                    });
                    resolve(true)
                }
            });
        })

        let p2 = new Promise((resolve, reject) => {
            wx.getStorage({
                key: 'user',
                success: res => {
                    this.setData({
                        user: res.data
                    })
                    resolve(true)
                }
            });
        })

        Promise.all([p1, p2]).then(res => {
            this.getPrintOrder().then(data => {
                this.setData(data.data)
                this.sendPrinterTask();
            }, err => {
                wx.showModal({
                    content: err,
                    success: _ => {
                        wx.reLaunch({
                            url: '../index/index',
                        })
                    }
                })
            })
        }).catch(err => {
            wx.showModal({
                content: err
            })
        })


    },
    //获取待打印列表
    getPrintOrder() {
        wx.showLoading({
            title: '加载中...',
        })
        return new Promise((resolve, reject) => {
            app.request({
                url: "api/web/waitPrinting",
                data: { 
                    printer_id: this.data.printer.id,
                    uid: this.data.user.id,
                },
                success: res => {
                    wx.hideLoading()
                    console.log(res.data)
                    if (res.data.code < 0) {
                        reject(res.data.msg)
                    } else {

                        resolve(res.data);
                    }
                },
                fail: err => {
                    wx.hideLoading()
                    wx.showModal({
                        title: "错误",
                        content: "获取打印订单失败",
                        success: res => {
                            if (res.confirm) {
                                wx.setClipboardData({
                                    data: JSON.stringify(err),
                                })
                            }
                        }
                    })
                }
            })
        })
    },
    //创建打印任务
    sendPrinterTask() {
        let lists = this.data.lists;
        let sendLists = [...lists];
        this.setData({
            sendLists: sendLists
        });
        this.setSend();

    },
    //发送打印任务
    setSend() {
        //1.取出第个待打印的文件,
        let sendLists = this.data.sendLists;

        if (sendLists.length === 0) {
            return;
        }

        let file = sendLists[0];

        //2.发送打印任务
        this.timer = null;
        app.request({
            url: "api/web/sendFileToLianke",
            data: {
                id: file.id
            },
            success: res => {
                res = res.data;
                if (res.code === 0) {
                    //删除第一个元素
                    sendLists.splice(0, 1);
                    this.setData({
                        sendLists: sendLists
                    });
                    //2.1 发送成功,进行下一步
                    let task_id = res.data.task_id;
                    this.updateShowPrintStatus(file.id, '正在发送');
                    //3.每隔10秒查询打印状态,更新打印状态
                    let task_state = {
                        READY:"排队中",
                        PARSING:"解析中",
                        SENDING:"发送中",
                        SUCCESS:"成功",
                        FAILURE:"失败",
                        SET_REVOKE:"标记为撤回",
                        REVOKED:"撤回成功",
                    };
                    this.timer = setInterval(_ => {
                        this.printStatus(file.id,task_id).then(res => {
                            //打印状态查询成功
                            //4.打印完成
                            console.log(res.data)
                            if (res.data.task_state == 'SUCCESS') {
                                clearInterval(this.timer)
                                //打印下一个文件
                                //5.返回第一步,如果为空,则全部打印完成.
                                this.setSend();
                            }
                            let print_desc = task_state[res.data.task_state];
                            this.updateShowPrintStatus(file.id, print_desc);
                        }, err => {
                            //打印状态查询失败
                            clearInterval(this.timer)
                        })
                    }, 5000);
                } else if(res.code === -1){
                    wx.showModal({
                      title:"提示",
                      content:res.msg,
                      showCancel:false,
                      confirmText:"返回首页",
                      success:res=>{
                          wx.redirectTo({
                            url: '../index/index',
                          })
                      }
                    })
                } else {
                    //2.2 发送失败,弹出提示,让用户选择退款或重试
                    wx.showModal({
                        title: "警告",
                        content: res.msg,
                        cancelText: "申请退款",
                        confirmText: "重试",
                        success: r => {
                            if (r.confirm) {
                                //重试
                                this.setSend();
                            } else {
                                //申请退款
                                this.orderRefund().then(res => {
                                    if (res.code == 0) {
                                        wx.showModal({
                                            title: "提示",
                                            content: "退款申请已提交,管理员审核后订单金额将原路退回!",
                                            showCancel: false,
                                        })
                                    } else {
                                        wx.showModal({
                                            content: res.msg,
                                            showCancel: false,
                                            success: _ => {
                                                wx.reLaunch({
                                                    url: '../index/index',
                                                })
                                            }
                                        })
                                    }
                                }, err => {})
                            }
                        }
                    })
                }
            },
            fail: err => {}
        })

    },
    //更新页面上显示的打印状态
    updateShowPrintStatus(id, print_desc) {
        let lists = this.data.lists;
        lists.forEach((item, index) => {
            if (item.id == id) {
                item.print_desc = print_desc;
            }
        })
        this.setData({
            lists: lists
        });
    },

    //查询打印状态
    printStatus(id,task_id) {
        wx.showNavigationBarLoading();
        return new Promise((resolve, reject) => {
            app.request({
                url: "api/web/getPrinterStatusLianke",
                data: {
                    id:id,
                    task_id: task_id
                },
                success: res => {
                    wx.hideNavigationBarLoading();
                    if (res.data.code === 0) {
                        resolve(res.data);
                    } else {
                        reject(res.data)
                    }
                }
            })
        })
    },
    //申请退款(整个订单全部退款)
    orderRefund() {
        wx.showLoading({
            title: '正在申请...',
        })
        return new Promise((resolve, reject) => {

            app.request({
                url: "api/web/refund",
                data: {
                    order_id: this.data.order.id,
                },
                success: res => {
                    wx.hideLoading();
                    resolve(res.data);
                },
                fail: err => {
                    wx.hideLoading();
                    reject(err);
                }
            })
        })
    },
})