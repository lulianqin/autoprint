const app = getApp();
Page({
    data: {
        printer_name: "未选择打印机"
    },
    onLoad: function (options) {

    },
    onShow: function () {
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
    choose(e) {
        let btn = e.currentTarget.dataset.btn;
        switch (parseInt(btn)) {
            case 1:
                wx.chooseImage({
                    count: 9,
                    sourceType: ["camera"],
                    success: res => {
                        for (let i = 0; i < res.tempFiles.length; i++) {
                            this.upload(res.tempFiles[i]);
                        }
                    }
                })
                break;
            case 2:
                wx.chooseMessageFile({
                    count: 9,
                    type: "image",
                    success: res => {
                        for (let i = 0; i < res.tempFiles.length; i++) {
                            this.upload(res.tempFiles[i]);
                        }
                    }
                })
                break;
            case 3:
                wx.chooseImage({
                    count: 9,
                    sourceType: ["album"],
                    success: res => {
                        for (let i = 0; i < res.tempFiles.length; i++) {
                            this.upload(res.tempFiles[i]);
                        }
                    }
                })
                break;
        }
    },
    upload(file) {
        let data = {
            path: file.path,
            filename: "照片打印_"+Date.parse(new Date()).toString().substr(0,10)+"."+file.path.split(".").pop().toLowerCase(),
            page_type: 2,
            process: "photo",
            size: "c6",
            doc_type: 4,
        };
        console.log(data)
        app.upload(data).then(res => {
            console.log("res",res);
            if (res.code == 0) {
                wx.showToast({
                    title: '上传成功',
                    mask: true,
                })
                setTimeout(_ => {
                    wx.navigateTo({
                        url: '../print_list/index?type=sc',
                    })
                }, 200)
            } else {
                wx.showModal({
                    title: "错误",
                    content: res.msg
                })
            }
        }, err => {
            console.log("res",err);
            wx.showModal({
                title: "提示",
                content: err.msg
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