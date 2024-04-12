const app = getApp();
Page({
    data: {
        hideSelectSize: true,
        hideSelectSizeItem: false,
        hideSelectSource: true,
        hideSelectBackground: true,
        //name,value值颠倒
        sizeSelect: [{
                name: "c1",
                value: "小1寸"
            },
            {
                name: "c1x",
                value: "1寸"
            }, {
                name: "c2",
                value: "小2寸"
            }, {
                name: "c2x",
                value: "2寸"
            },
        ],
        sizeAndBackgroundSelect: [{
                name: "一寸",
                value: 1,
                s_name: "c1x"
            },
            {
                name: "小一寸",
                value: 4,
                s_name: "c1"
            },
            {
                name: "二寸",
                value: 10,
                s_name: "c2x"
            },
            {
                name: "小二寸",
                value: 13,
                s_name: "c2"
            }
        ],
        selectedIndex: 0,
        selectedSizeAndBackgroundIndex: 0,
        btn: 0,

        printer_name: "未选择打印机"
    },
    onLoad: function (options) {
        
    },
    onShow: function () {
        this.close()
        wx.getStorage({
            key: 'printer',
            success: res => {
                console.log(res.data)
                this.setData({
                    printer_name: `${res.data.name}(${res.data.shop_name})`,
                    printer: res.data,
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
    hasPhoto() {
        this.setData({
            hideSelectSize: false,
            hideSelectBackground: true,
            hideSelectSizeItem: false,
            btn: 1,
        })
    },
    selectedSize(e) {
        let index = e.detail.value;
        this.setData({
            selectedIndex: index
        })
    },
    close() {
        this.setData({
            hideSelectSize: true,
            hideSelectSource: true,
        })
    },
    confirmSize() {
        this.setData({
            hideSelectSize: true,
            hideSelectSource: false,
        })
    },
    getPrinter(printer_id) {
        wx.showLoading({
            title: '加载中...',
            mask: true,
        })
        wx.request({
            url: `${app.api}/api/shop/printer`,
            data: {
                printer_id: printer_id
            },
            success: res => {
                let printer = res.data.data;
                wx.setStorageSync('printer', printer);
                this.setData({
                    printer_name: printer.name
                });

                wx.getStorage({
                    key: 'user',
                    success: res => {


                        wx.showToast({
                            title: '选择打印机成功',
                            duration: 1000
                        })
                        wx.navigateBack({
                            delta: 1,
                        })
                    }
                });
            }
        })
    },
    //选择照片
    choosePhoto(e) {
        let type = e.currentTarget.dataset.type;
        let btn = this.data.btn;
        switch (parseInt(type)) {
            case 1:
                wx.chooseImage({
                    count: 1,
                    sourceType: ["camera"],
                    success: res => {
                        let path = res.tempFiles[0]["path"]

                        if (btn == 1) {
                            this.process1(path);
                        }
                        if (btn == 2) {
                            this.process2(path);
                        }
                    }
                })
                break;
            case 2:
                wx.chooseMessageFile({
                    count: 1,
                    type: "image",
                    success: res => {
                        let path = res.tempFiles[0]["path"]
                        if (btn == 1) {
                            this.process1(path);
                        }
                        if (btn == 2) {
                            this.process2(path);
                        }
                    }
                })
                break;
            case 3:
                wx.chooseImage({
                    count: 1,
                    sourceType: ["album"],
                    success: res => {
                        let path = res.tempFiles[0]["path"]
                        if (btn == 1) {
                            this.process1(path);
                        }
                        if (btn == 2) {
                            this.process2(path);
                        }
                    }
                })
                break;
        }
    },
    process1(path) {
        wx.showLoading({
            title: '正在合成图片...',
            mask: true,
        })
        let selected = this.data.sizeSelect[this.data.selectedIndex];
        let file = {
            path: path,
            filename: selected['value'] + ".jpg",
            page_type: 2,
            process: selected['name'],
            size: selected['name']
        };
        app.upload(file).then(res => {
            //photo: "https://print.52ycu.cn/storage/20200730/de4028c8685d2c28308bf4cdcedfa9fc.jpeg"
            //url: "https://print.52ycu.cn/storage/20200730/42ab7279564ad20105d556797cf2476c.jpeg"
            wx.hideLoading();
            wx.setStorage({
                data: Object.assign(res.data, {
                    btn: this.data.btn,
                    size: file["size"]
                }),
                key: "id_photo",
                success: _ => {
                    wx.showToast({
                        title: '操作成功',
                        mask: true,
                        success: _ => {
                            wx.navigateTo({
                                url: './confirm',
                            })
                        }
                    })
                }
            })
        }, err => {
            wx.hideLoading();
            wx.showModal({
                title: "错误",
                content: err.msg,
            })
        });
    },

    //生成电子照
    makePhoto() {
        this.setData({
            hideSelectSize: false,
            hideSelectSizeItem: true,
            hideSelectBackground: false,
            btn: 2
        })
    },
    s_con(e) {
        if (e.currentTarget.dataset.type == 1) {
            this.data.selectedIndex = e.currentTarget.dataset.pid;
        }
        if (e.currentTarget.dataset.type == 2) {
            this.data.selectedSizeAndBackgroundIndex = e.currentTarget.dataset.pid;
        }
        this.setData({
            hideSelectSource: false,
        })
    },
    //选择生成的电子照的尺寸和背景
    selectedSizeAndBackground(e) {
        let index = e.detail.value;
        this.setData({
            selectedSizeAndBackgroundIndex: index,
        })
    },
    process2(path) {
        wx.showLoading({
            title: '正在生成预览...',
            mask: true,
        });
        let selected = this.data.sizeAndBackgroundSelect[this.data.selectedSizeAndBackgroundIndex];
        let file = {
            path: path,
            filename: selected["name"],
            page_type: 2,
            process: "api_check",
            sepc_id: selected["value"],
        };
        app.upload(file).then(res => {
            console.log(res)
            wx.hideLoading();
            wx.setStorage({
                data: Object.assign(res.data, {
                    btn: this.data.btn,
                    s_name: selected["s_name"]
                }),
                key: 'id_photo',
                success: _ => {
                    wx.navigateTo({
                        url: './confirm',
                    })
                }
            })
        }, err => {
            wx.hideLoading();
            wx.showModal({
                title: "错误",
                content: err.msg,
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