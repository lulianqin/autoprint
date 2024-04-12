const app = getApp();
Page({
    data: {
        printer_name: "未选择打印机"
    },
    onLoad: function (options) {
        console.log(app)
        wx.getStorage({
            key: 'ad',
            success: data => {
                if (typeof data.video !== "undefined" && data.video !== "") {
                    //视频广告
                    this.setData({
                        video: data.video
                    });
                }
                if (typeof data.interstitial !== "undefined" && data.interstitial !== "") {
                    //插屏广告
                    this.setData({
                        interstitial: data.interstitial
                    });
                }
            }
        })
    },
    onShow: function () {
        wx.getStorage({
            key: 'user',
            success: res => {

                this.setData({
                    user: res.data,
                    page_type: wx.getStorageSync('page_type')
                })
            },
            fail: err => {
                wx.showToast({
                    title: '未登录',
                    icon: "none",
                    mask: true,
                })
                setTimeout(_ => {
                    wx.reLaunch({
                        url: "../index/index"
                    });
                }, 500)
            }
        })

        wx.getStorage({
            key: 'printer',
            success: res => {
                console.log(res.data)
                this.setData({
                    printer_name: `${res.data.name}(${res.data.shop_name})`,
                    printer: res.data,
                })
            },
            fail: err => {
                wx.showModal({
                    title: "提示",
                    content: "请先选择打印机",
                    showCancel: false,
                    confirmText: "去选择",
                    success: res2 => {
                        if (res2.confirm) {
                            wx.navigateTo({
                                url: '../shop/index',
                            })
                        }
                    }
                })
            }
        })

        wx.getStorage({
            key: 'ad',
            success: data => {
                data = data.data;
                if (typeof data.video !== "undefined" && data.video !== "") {
                    //视频广告
                    this.setData({
                        video: data.video
                    });
                }
                if (typeof data.interstitial !== "undefined" && data.interstitial !== "") {
                    //插屏广告
                    this.setData({
                        interstitial: data.interstitial
                    });
                    // 在页面中定义插屏广告
                    let interstitialAd = null

                    // 在页面onLoad回调事件中创建插屏广告实例
                    if (wx.createInterstitialAd) {
                        interstitialAd = wx.createInterstitialAd({
                            adUnitId: data.interstitial
                        })
                        interstitialAd.onLoad(() => {})
                        interstitialAd.onError((err) => {})
                        interstitialAd.onClose(() => {})
                    }

                    // 在适合的场景显示插屏广告
                    if (interstitialAd) {
                        interstitialAd.show().catch((err) => {
                            console.error(err)
                        })
                    }
                }
            }
        });
    },
    selectFile: function (e) {
        let type = e.currentTarget.dataset.type;
        wx.chooseMessageFile({
            count: 9,
            type: type,
            extension: ["doc", "docx", "xls", "xlsx", "pdf", "txt", "ppt", "pptx"],
            success: res => {
                console.log(res)
                for (let i = 0; i < res.tempFiles.length; i++) {
                    let file = {
                        path: res.tempFiles[i]["path"],
                        filename: res.tempFiles[i]["name"],
                        doc_type: 1
                    };
                    app.upload(file, this.data.printer.id).then(_ => {
                        wx.navigateTo({
                            url: '../print_list/index?type=sc',
                        })
                    }, err => {
                        wx.showModal({
                            title: "错误",
                            content: (file.filename + err.msg) || (file.filename + JSON.stringify(err))
                        })
                        console.log(err)
                    })
                }
            }
        })
    },
    onShareAppMessage() {
        let share = {};
        wx.getStorage({
            key: 'share',
            success: res => {
                let mini = res.data.mini;
                share = {
                    title: mini.title,
                    path: "/pages/index/index",
                    imageUrl: mini.image,
                }
            }
        })
        return share;
    },
    onShareTimeline() {
        let share = {};
        wx.getStorage({
            key: 'share',
            success: res => {
                let momnet = res.data.momnet;
                share = {
                    title: momnet.title,
                    query: {
                        printer_id: this.data.printer.id || 0
                    },
                    imageUrl: momnet.image,
                }
            }
        })
        return share;
    }
})