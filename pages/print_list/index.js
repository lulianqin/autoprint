const app = getApp();
Page({
    data: {
        hideSetting: true,
        hideAdd: true,
        pagesPicker: [
            [1, 2, 3, 4, 5],
            [1, 2, 3, 4, 5]
        ],
        ext: {
            jpeg: {
                icon: "../../images/JPG@2x.png",
                color: "#6CE4D8"
            },
            jpg: {
                icon: "../../images/JPG@2x.png",
                color: "#6CE4D8"
            },
            png: {
                icon: "../../images/PNG@2x.png",
                color: "#FFD93B"
            },
            xls: {
                icon: "../../images/XLSX@2x.png",
                color: "#9ED463"
            },
            xlsx: {
                icon: "../../images/XLSX@2x.png",
                color: "#9ED463"
            },
            ppt: {
                icon: "../../images/PPT@2x.png",
                color: "#F8A53B"
            },
            pptx: {
                icon: "../../images/PPT@2x.png",
                color: "#F8A53B"
            },
            pdf: {
                icon: "../../images/PDF@2x.png",
                color: "#EF427C"
            },
            doc: {
                icon: "../../images/DOC@2x.png",
                color: "#5E7EE8"
            },
            docx: {
                icon: "../../images/DOC@2x.png",
                color: "#5E7EE8"
            }
        },
        printer_name: "未选择打印机",

        hideSides: false,
        hideColor: false,
        hideOrientation: false,
        hidePages: false,
        hideCopies: false,

        total_fee: 0.00,

        payment_success: false,
        page_sy: "",
        sc_type: false
    },
    onLoad: function (options) {
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        this.data.page_sy = prevpage.route;
        if (options) {
            if (options.type == "sc") {
                this.setData({
                    sc_type: true
                });
            }
        }
        this.getPrintLists(null, true);
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
            fail: err => {
                wx.navigateBack({
                    delta: 1,
                })
            }
        })

        //跳转到网页上传文件，返回时自动关闭
        this.setData({
            hideAdd: true
        });

        wx.getStorage({
            key: 'printer',
            success: res => {
                console.log(res.data)
                this.setData({
                    printer_name: `${res.data.name}(${res.data.shop_name})`,
                    printer: res.data,
                    payment_success: false,
                })
                this.getTotalFee();
            },
            fail(err) {
                console.log(err)
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
    onHide() {

    },
    getTotalFee(callback = null) {
        if (typeof this.data.printer !== "undefined") {
            app.request({
                url: "api/buy/calcTotalFee",
                data: {
                    printer_id: this.data.printer.id
                },
                success: res => {
                    if (res.data.code == 0) {
                        console.log(res.data.data);
                        this.setData({
                            total_fee: res.data.data.total_fee
                        });
                        if (typeof callback === "function") {
                            callback(res.data);
                        }
                    } else {
                        wx.showToast({
                            title: '未选择打印机',
                            icon: "none",
                            mask: true,
                        })
                    }
                },
                fail: err => {
                    wx.hideLoading();
                    console.log(err);
                }
            })
        }
    },
    //获取打印列表
    getPrintLists(callback = null, jz = false) {
        app.request({
            url: "api/printer/index",
            success: res => {
                console.log(res.data.data);
                if (res.data.data.length == 0) {
                    wx.showToast({
                        title: '暂无待打印文件',
                        icon: "none",
                        mask: true,
                    })
                } else {
                    this.setData({
                        lists: res.data.data
                    });
                    if (jz) {
                        if (this.data.sc_type) {
                            this.s_set();
                        }
                    }
                    if (typeof callback === "function") {
                        callback(res.data);
                    }
                }
            }
        })
    },
    preview(e) {
        wx.showLoading({
            title: '正在打开...',
            mask: true,
        })
        let index = e.currentTarget.dataset.index;
        let file = this.data["lists"][index];
        let url = file.file;
        let ext = file["filename"].split(".").pop().toLowerCase();
        // url = url||file.pdf;
        wx.downloadFile({
            url: url,
            success: res => {
                wx.hideLoading();
                switch (ext) {
                    case "doc":
                    case "docx":
                    case "xls":
                    case "xlsx":
                    case "ppt":
                    case "pptx":
                    case "pdf":
                        wx.openDocument({
                            filePath: res.tempFilePath,
                        })
                        break;
                    case "jpg":
                    case "png":
                    case "jpeg":
                        wx.previewImage({
                            urls: [res.tempFilePath],
                            current: res.tempFilePath
                        })
                        break;
                    default:
                        wx.showToast({
                            title: '文件类型不支持预览',
                            icon: "none",
                            mask: true,
                        })
                }
            },
            fail: err => {
                console.log(err);
                err = JSON.stringify(err);
                wx.showModal({
                    title: "警告",
                    content: "预览错误",
                    confirmText: "复制错误",
                    success: _ => {
                        if (_.confirm) {
                            wx.setClipboardData({
                                data: err,
                            })
                        }
                    }
                })
            }
        })
    },
    deleteFile: function (e) {
        let id = e.currentTarget.dataset.id;
        wx.showModal({
            title: "提示",
            content: "确定要删除吗?",
            success: res => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '正在删除',
                    })
                    app.request({
                        url: "api/printer/delete",
                        data: {
                            id: id
                        },
                        success: res => {
                            wx.hideLoading();
                            wx.showToast({
                                title: res.data.msg,
                                icon: "none",
                                mask: true,
                                duration: 200,
                            })
                            if (res.data.code === 0) {
                                this.setData({
                                    lists: res.data.data
                                })

                                if (res.data.data.length === 0) {
                                    wx.showToast({
                                        title: '暂无可打印文件',
                                        icon: "none",
                                        mask: true,
                                    })
                                    setTimeout(_ => {
                                        wx.redirectTo({
                                            url: '../index/index',
                                        })
                                    }, 500)
                                }

                            };
                            this.getTotalFee();
                        }
                    })
                }
            }
        })
    },
    s_set() {
        let index = 0;
        let file = this.data["lists"][0];
        let ext = file["filename"].split(".").pop().toLowerCase();

        console.log("s_set_file", file);
        if (file.page_type === 1) {
            if (file.filename == "身份证.png") {
                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: true,
                    hideColor: false,
                    hideOrientation: true,
                    hidePages: true,
                    hideCopies: false,
                })
            } else if (file.filename == "拍照扫描.jpg") {

                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: true,
                    hideColor: false,
                    hideOrientation: false,
                    hidePages: true,
                    hideCopies: false,
                })
            } else if (file.ext === "jpeg" || file.ext === "jpg" || file.ext === "png") {
                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: true,
                    hideColor: false,
                    hideOrientation: false,
                    hidePages: true,
                    hideCopies: false,
                })
            } else {
                this.makePagePicker(index);
                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: false,
                    hideColor: false,
                    hideOrientation: false,
                    hidePages: false,
                    hideCopies: false,
                })
            }

        }

        if (file.page_type === 2) {
            this.setData({
                setting: file,
                hideSetting: false,
                hideSides: true,
                hideColor: true,
                hideOrientation: true,
                hidePages: true,
                hideCopies: false,
            })
        }
    },
    setting(e) {
        let index = e.currentTarget.dataset.index;
        let file = this.data["lists"][index];
        let ext = file["filename"].split(".").pop().toLowerCase();
        let printer = this.data.printer;
        console.log("setting_file", file);
        if (printer.functions.double_side == 1 && file.color == 1) {
            file.color = 1;
        } else if (printer.functions.single_side == 1 && file.color == 2) {
            file.color = 2;
        }
        if (file.page_type === 1) {
            if (file.filename == "身份证.png") {
                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: true,
                    hideColor: false,
                    hideOrientation: true,
                    hidePages: true,
                    hideCopies: false,
                })
            } else if (file.filename == "拍照扫描.jpg") {

                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: true,
                    hideColor: false,
                    hideOrientation: false,
                    hidePages: true,
                    hideCopies: false,
                })
            } else if (file.ext === "jpeg" || file.ext === "jpg" || file.ext === "png") {
                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: true,
                    hideColor: false,
                    hideOrientation: false,
                    hidePages: true,
                    hideCopies: false,
                })
            } else {
                this.makePagePicker(index);
                this.setData({
                    setting: file,
                    hideSetting: false,
                    hideSides: false,
                    hideColor: false,
                    hideOrientation: false,
                    hidePages: false,
                    hideCopies: false,
                })
            }

        }

        if (file.page_type === 2) {
            this.setData({
                setting: file,
                hideSetting: false,
                hideSides: true,
                hideColor: true,
                hideOrientation: true,
                hidePages: true,
                hideCopies: false,
            })
        }
    },
    close() {
        this.setData({
            hideSetting: true,
        })
    },
    //页码选择
    makePagePicker(index) {
        let pages = this.data.lists[index]["pages"];
        let pagesPicker = [];
        if (pages > 1) {

            let start = [];
            let end = [];
            for (let i = 1; i <= pages; i++) {
                start.push(i);
                end.push(i);
            }

            pagesPicker = [start, end];
        } else {
            pagesPicker = [
                [1],
                [1]
            ];
        }

        this.setData({
            pagesPicker: pagesPicker
        });
    },
    //单双面设置
    settingSide(e) {
        let side = e.currentTarget.dataset.side;
        if (side == 2 && this.data.printer.functions.double_side != 1) {
            wx.showToast({
                title: '不可使用双面',
                icon: 'success',
                duration: 2000
            })
            return false;
        }
        let setting = this.data.setting;
        setting.side = side;
        this.setData({
            setting: setting
        })
    },
    //黑白设置
    settingColor(e) {
        let color = e.currentTarget.dataset.color;
        if (color == 1 && this.data.printer.functions.black_white != 1) {
            wx.showToast({
                title: '不可使用黑白',
                icon: 'success',
                duration: 2000
            })
            return false;
        }
        if (color == 2 && this.data.printer.functions.colorful != 1) {
            wx.showToast({
                title: '不可使用彩色',
                icon: 'success',
                duration: 2000
            })
            return false;
        }

        let setting = this.data.setting;
        setting.color = color;
        this.setData({
            setting: setting
        })
    },
    //打印方向
    settingOrientation(e) {
        let orientation = e.currentTarget.dataset.orientation;
        let setting = this.data.setting;
        setting.orientation = orientation;
        this.setData({
            setting: setting
        })
    },
    //页面范围
    bindPagesPickerColumnChange(e) {
        let pagesPicker = this.data.pagesPicker;
        let page_count = pagesPicker[0].length;
        let value = e.detail.value;
        let column1 = [];
        if (e.detail.column === 0) {
            for (let i = 1; i <= (page_count - value); i++) {
                column1.push(i + value);
            }
            console.log(e, value, page_count, column1);
            pagesPicker[1] = column1;
            this.setData({
                pagesPicker: pagesPicker
            })
        }
    },
    bindPagesPickerChange(e) {
        console.log(e)
        let setting = this.data.setting;
        let pagesPicker = this.data.pagesPicker;
        setting.page_start = pagesPicker[0][e.detail.value[0]];
        setting.page_end = pagesPicker[1][e.detail.value[1]];
        this.setData({
            setting: setting
        })
    },
    //打印份数
    settingCopies(e) {
        let setting = this.data.setting;
        let copies = setting.copies;
        let field = e.currentTarget.dataset.field;
        if (field === "subtract") {
            copies = copies - 1 > 0 ? copies - 1 : 1;
        } else {
            copies += 1;
        }

        setting.copies = copies;
        this.setData({
            setting: setting
        })
    },
    confirmSetting() {
        let setting = this.data.setting;
        let lists = this.data.lists;
        lists.forEach((item, index) => {
            if (item.id === setting.id) {
                lists[index] = setting;
            }
        })
        wx.showLoading({
            title: '正在设置...',
            mask: true,
        })
        app.request({
            url: "api/printer/setting",
            data: setting,
            method: "POST",
            success: res => {
                wx.showToast({
                    title: res.data.msg,
                    mask: true,
                    duration: 100,
                })
                this.setData({
                    lists: lists,
                    setting: null,
                    hideSetting: true,
                })
                //更新打印列表
                this.getPrintLists();
                this.getTotalFee();
            }
        });
    },
    //显示添加文件窗口
    addFile() {
        this.setData({
            hideAdd: false
        })
    },
    //关闭添加文件窗口
    closeAddFile() {
        this.setData({
            hideAdd: true
        })
    },
    selectFile: function (e) {
        this.closeAddFile();
        let type = e.currentTarget.dataset.type;
        console.log(type);
        wx.setStorageSync('page_type', 1);
        wx.chooseMessageFile({
            count: 9,
            type: type,
            extension: ["doc", "xls", "xlsx", "docx", "ppt", "pptx", "pdf"],
            success: res => {
                for (let i = 0; i < res.tempFiles.length; i++) {
                    let file = {
                        path: res.tempFiles[i]["path"],
                        filename: res.tempFiles[i]["name"],
                        doc_type: 1,
                        //printer_id: this.data.printer.id,
                    };
                    app.upload(file, this.data.printer.id).then(res => {
                        console.log(res);
                        this.setData({
                            lists: res.printer_list,
                        })
                        this.s_set();
                        this.getTotalFee();
                        if (this.data.printer_id) {
                            wx.showLoading({
                                title: '正在更新价格',
                                mask: true,
                            })
                            this.getTotalFee(data => {
                                wx.hideLoading()
                                this.setData({
                                    total_fee: data.data.total_fee,
                                })
                            })
                        }
                    }, err => {
                        wx.showModal({
                            title: "提示",
                            content: err.msg
                        })
                    })
                }
            }
        })
    },
    onPullDownRefresh() {
        this.getTotalFee();
        this.getPrintLists(_ => {
            wx.stopPullDownRefresh({
                success: (res) => {
                    wx.showToast({
                        title: '已刷新',
                        icon: "none",
                        mask: true
                    })
                },
                fail: (res) => {},
                complete: (res) => {},
            })
        });
    },
    editPhoto(e) {
        let index = e.currentTarget.dataset.index;
        let photo_data = this.data.lists[index];
        let data = {
            path: photo_data.file,
            size: "photo",
            process: "Photoedit",
            printer_id: photo_data.id,
        };
        wx.setStorage({
            data: data,
            key: 'takePhoto',
            success: _ => {
                wx.navigateTo({
                    url: '../photo_resize/index',
                })
            }
        })
    },
    payment() {
        if (this.data.printer === undefined) {
            wx.showModal({
                content: "未选择打印机",
                confirmText: "去选择",
                success: res => {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '../shop/index',
                        })
                    }
                }
            })
            return;
        }

        //测试用
        // let url = `${app.api}/api/web/waitPrinting`;
        // wx.redirectTo({
        //     url: `../web-view/index?src=${url}&printer_id=${this.data.printer.id}`,
        // })
        // return;
        this.deviceInfo().then(text => {
            wx.showModal({
                title: "提示",
                content: `你已经选择了【${this.data.printer.name}】打印机,支付后将立即打印!`,
                success: res => {
                    if (res.confirm) {

                        app.request({
                            url: "api/buy/printerOrder",
                            data: {
                                printer_id: this.data.printer.id,
                            },
                            success: res => {
                                console.log("后台参数");
                                console.log(res.data);
                                if (res.data.code < 0) {
                                    wx.showModal({
                                        title: "错误",
                                        content: res.data.msg,
                                        confirmText: '复制错误',
                                        success: _ => {
                                            if (_.confirm) {
                                                wx.setClipboardData({
                                                    data: JSON.stringify(res.data),
                                                })
                                            }
                                        }
                                    })
                                    return;
                                }
                                if (res.data.code == 0) {
                                    //调起支付
                                    console.log("调起支付");
                                    console.log("this", this.data.lists);
                                    let obj = Object.assign(res.data.data.config);
                                    console.log("obj", obj);
                                    wx.requestPayment(Object.assign(res.data.data.config, {
                                        success: res => {
                                            this.setData({
                                                payment_success: true,
                                            })
                                            console.log(res);
                                            let sendLists = this.data.lists;
                                            for (var i = 0; i < sendLists.length; i++) {
                                                var prid = sendLists[i].id;
                                                app.request({
                                                    url: "api/web/sendFileToLianke",
                                                    data: {
                                                        id: prid
                                                    },
                                                    success: res => {
                                                        console.log(res);
                                                        app.request({
                                                            url: "api/web/loopgetPrinterStatusLianke",
                                                            data: {
                                                                id:prid,
                                                                task_id: res.data.data.task_id
                                                            },
                                                        })
                                                    }
                                                })
                                            }
                                            wx.showToast({
                                                title: '支付成功',
                                                mask: true,
                                            })
                                            setTimeout(_ => {
                                                wx.redirectTo({
                                                    url: '../printing/index',
                                                })
                                            }, 500)
                                        },
                                        fail: err => {
                                            console.log("ERR", err)
                                            wx.showToast({
                                                title: '支付失败',
                                                icon: "none",
                                                mask: true,
                                            })
                                        }
                                    }))
                                } else if (res.data.code == 1) {
                                    //免费打印
                                    wx.showModal({
                                        title: "温馨提示",
                                        content: "本次为免费打印,点击确定按钮立即打印",
                                        success: _ => {
                                            if (_.confirm) {
                                                wx.redirectTo({
                                                    url: '../printing/index',
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })

                    }
                }
            })
        }, err => {
            wx.showModal({
                title: "打印机状态提示",
                content: err,
                showCancel: false,
            })
        })
    },
    //查询打印机状态
    deviceInfo() {
        wx.showLoading({
            title: '正在查询打印机状态',
            mask: true,
        })
        return new Promise((resolve, reject) => {

            let device = {
                device_id: this.data.printer.device_id,
                device_key: this.data.printer.device_key
            }
            app.request({
                url: "api/upload/deviceInfo",
                method: "post",
                data: {
                    device: [device]
                },
                success: res => {
                    console.log(res)
                    wx.hideLoading();
                    let status = res.data[device.device_id]['online'];
                    let text_status = ['打印机盒子未上线', '打印机盒子在线', '打印盒子状态未知'];
                    if (status === 1) {
                        resolve(text_status[status]);
                    } else {
                        reject(text_status[status]);
                    }
                },
                fail: err => {
                    wx.hideLoading();
                    console.log(err);
                    reject(err);
                }
            })
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