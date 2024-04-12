const app = getApp();
Page({
    data: {
        printer_name: "附近的打印机"
    },
    onLoad: function (options) {
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
    onReady: function () {
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
        this.getPrinters();
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
    onShow: function () {},
    //获取指定范围内的打印机
    getPrinters(distance = 1000) {
        wx.getLocation({
            altitude: 'altitude',
            isHighAccuracy: true,
            type: "wgs84",
            success: res => {
                wx.showLoading({
                    title: '加载中...',
                    mask: true,
                })
                app.request({
                    url: "api/shop/nearByShop",
                    data: {
                        latitude: res.latitude,
                        longitude: res.longitude,
                        distance: distance
                    },
                    success: res => {
                        wx.hideLoading()
                        this.setData(res.data.data);

                        //查询打印机在线状态
                        this.searchPrintersOnlineStatus();
                    },
                    fail: err => {
                        wx.hideLoading()
                        console.log(err)
                        wx.showToast({
                            title: err,
                        })
                    }
                })
            }
        })
    },
    //查询打印机在线状态
    searchPrintersOnlineStatus() {
        wx.showNavigationBarLoading();
        let printers = this.data.printer;
        let device = [];
        for (let i = 0; i < printers.length; i++) {
            device.push({device_id:printers[i]['device_id'],device_key:printers[i]['device_key']});
        }
        app.request({
            url: "api/shop/deviceInfo",
            method:"post",
            data: {
                device: device,
            },
            success: res => {
                wx.hideNavigationBarLoading();
                let online_text = ["打印盒子未上线", "打印盒子在线", "查询失败"];
                let text = online_text[2];
                //status	int	状态：0盒子未上线；1打印机未连接；2打印机已连接
                if (typeof res.data === "undefined") {
                    for (let i = 0; i < printers.length; i++) {
                        printers[i]["online"] = text;
                    }
                } else {
                    res = res.data;
                    for (let i = 0; i < printers.length; i++) {
                        let device_id = printers[i]["device_id"];
                        if (typeof res[device_id] !== "undefined") {
                            text = online_text[res[device_id]["online"]];
                        } else {
                            text = online_text[2];
                        }
                        printers[i]["online"] = text;
                    }
                }
                this.setData({
                    printer: printers
                });
            }
        })
    },
    //选择打印机
    selectPrint: function (e) {
        let printer_id = e.currentTarget.dataset.id;
        this.getPrinter(printer_id);
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
    },
    showCustomerQrcode(e) {
        let index = e.currentTarget.dataset.index;
        let qrcode = this.data.printer[index].tel;
        console.log(qrcode);
        wx.makePhoneCall({
            phoneNumber: qrcode,
        })
    },
    navigatorToShop(e) {
        let index = e.currentTarget.dataset.index;
        let printer = this.data.printer[index];
        console.log(printer);
        let lat = parseFloat(printer.lat);
        let lng = parseFloat(printer.lng);
        wx.openLocation({
            latitude: lat,
            longitude: lng,
        })

    },
    searchPrinter() {
        let menu = ["500米", "1000米", "2000米", "5000米","9999999米(最大范围)"];
        wx.getStorage({
            key: 'user',
            success: res => {
                console.log(res.data.nickName)
                if (res.data.nickName === "厚光") {
                    menu.push("100000000米");
                }
                console.log('tapIndex',parseInt(menu[res.tapIndex]));
                wx.showActionSheet({
                    alertText: "搜索范围",
                    itemList: menu,
                    success: res => {
                        this.getPrinters(parseInt(menu[res.tapIndex]));
                    }
                })
            },
            fail() {
                wx.showActionSheet({
                    alertText: "搜索范围",
                    itemList: menu,
                    success: res => {
                        this.getPrinters(parseInt(menu[res.tapIndex]));
                    }
                })
            }
        })

    }
})