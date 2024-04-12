const app = getApp()

Page({
    data: {
        hideLogin: true,
        printer_name: "请扫码选择打印机",
    },
    onLoad: function (option) {

        //启动参数
        let printer_id = 0;
        if (typeof option.scene !== "undefined") {
            printer_id = decodeURIComponent(option.scene).split(":")[1];
        }
        if (option.printer_id) {
            printer_id = option.printer_id;
        }
        this.setData({
            printer_id: printer_id
        });
        if (printer_id > 0) {
            this.getPrinter(printer_id);
        } else {
            wx.getStorage({
                key: 'printer',
                success: res => {
                    console.log(res.data)
                    this.setData({
                        printer_name: `${res.data.name}(${res.data.shop_name})`,
                    })
                }
            })
        }
    },
    //通过scene=1167 H5开放标签进入小程序，保存数据
    //path: "pages/index/index"
    //query:
    //  id: "26"
    //  order_sn: "PRINT2012051021015219"
    //referrerInfo: {}
    //scene: 1167
    //shareTicket: undefined
    referer(data) {
        if (data.scene == 1167) {
            let query = data.query;
            wx.getStorage({
                key: 'referer_data',
                success: res => {
                    if (res.data.order_sn !== data.query.order_sn) {
                        //发送打印文件
                        this.sendFileToPrintList(query);
                    }
                },
                fail: err => {
                    this.sendFileToPrintList(query);
                }
            })
            wx.setStorage({
                key: 'referer_data',
                data: data.query,
            })
        }
    },
    //发送打印文件到队列
    sendFileToPrintList(query) {
        wx.showNavigationBarLoading();
        wx.showLoading({
            title: '加载中...',
        })
        app.request({
            url: "api/knowledge/upload",
            data: query,
            success: res => {
                wx.hideNavigationBarLoading();
                wx.hideLoading();
                wx.navigateTo({
                    url: '../print_list/index',
                })
            }
        })
    },
    onReady() {
        // console.log("onready")
        this.getBanner();
    },
    getPrinter(printer_id) {
        wx.request({
            url: `${app.api}/api/shop/printer`,
            data: {
                printer_id: printer_id
            },
            success: res => {
                this.setData({
                    printer: res.data.data,
                    printer_name: `${res.data.data.name}(${res.data.data.shop_name})`,
                    //qrcode:qrcode
                })
                wx.setStorageSync('printer', res.data.data);

                // wx.getStorage({
                //     key: 'user',
                //      success: res => {
                //     //     wx.navigateTo({
                //     //         url: '../print_list/index',
                //     //     })
                //     }
                // })

            }
        })
    },
    onShow: function () {
        wx.getStorage({
            key: 'user',
            success: res => {
                this.setData({
                    user: res.data
                });
                this.getPrintLists(data => {

                    this.setData({
                        lists: data.length
                    })
                    this.referer(wx.getEnterOptionsSync());
                })
            },
            fail: err => {
                console.log(err)
            }
        });
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
                        interstitialAd.onLoad(() => { })
                        interstitialAd.onError((err) => { })
                        interstitialAd.onClose(() => { })
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

        let printer_id = this.data.printer_id;
        if (printer_id > 0) {
            this.getPrinter(printer_id);
        } else {
            wx.getStorage({
                key: 'printer',
                success: res => {
                    console.log(res.data)
                    this.setData({
                        printer_name: `${res.data.name}(${res.data.shop_name})`,
                    })
                }
            })
        }

        let canIuseGetUserProfile = true;
        if (typeof wx.getUserProfile != "function") {
            canIuseGetUserProfile = false;
        }
        this.setData({ canIuseGetUserProfile: canIuseGetUserProfile });
    },
    //获取打印列表
    getPrintLists(callback = null) {
        wx.showLoading({
            title: '加载中...',
        })
        app.request({
            url: "api/printer/index",
            success: res => {
                wx.hideLoading()
                if (typeof callback === "function") {
                    callback(res.data.data);
                }
            }
        })
    },
    getBanner() {
        app.request({
            url: "api/index/banner",
            success: res => {
                let data = res.data.data;
                this.setData({
                    banner: data
                });
            }
        }, false)
    },
    //banner跳转
    redirect(e) {
        let index = e.currentTarget.dataset.index;
        let link = this.data.banner[index]["link"];
        if (link) {
            wx.navigateTo({
                url: `../web-view/page?url=${link}`,
            })
        }
    },
    jumpUrl: function (e) {
        wx.getStorage({
            key: 'user',
            success: res => {
                wx.getStorage({
                    key: 'printer',
                    success: res1 => {
                        console.log(e);
                        let url = e.currentTarget.dataset.url;
                        let print_type = e.currentTarget.dataset.printType;
                        let page_type = e.currentTarget.dataset.pageType;
                        wx.setStorageSync('page_type', parseInt(page_type));
                        wx.setStorageSync('print_type', parseInt(print_type));
                        wx.navigateTo({
                            url: url,
                        })
                    }, fail: err => {
                        wx.showModal({
                            title: "提示",
                            content: "请先选择打印机",
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
                
            },
            fail: err => {
                this.setData({
                    hideLogin: false
                })
            }
        })
        


    },
    getUserInfo: function (e) {
        let _this = this;
        wx.showLoading({
            title: '登录中...',
            mask: true
        })
        console.log("getUserProfile",wx.getUserProfile)
        if (typeof wx.getUserProfile == "undefined") {
            //pc端小程序不支持新接口
            console.log('getUserInfo')
            wx.getUserInfo({
                lang: 'zh_CN',
                success: data => {
                    //cloudID: "44_IwnxwD1lwOAt5xkjSvj8GWnXUBJi2ItPSac8qk19X958srpwc_XRnKA0IXs"
                    // encryptedData: "L1vfVvwPdjZfh3GnwmQv/hNS9KUEohqWFnQf3cDsERdBsELZMeO4iDV0tWlv1MniHDhNN4Xl5K9H/4/tBJA1vlVHnNJTrZAFK/KfIh+vz4NonxqsZbuNvrgfjJHpThUc+BqSRxws26KlFBvTklXEG9WqTiypiKewd+jb5ZPDPZ2AQLQq5z/Y0XyHQYfAJ4Mu59Oz+En1FM8gEmXXp2qKguaI3fwBkiGvi2Ih3ZhxxOUl93yi1jiD2lCZoO091iGeSLDWOCOCTfdymootS3UUQYrNgj2JeSSup7QUO+Ac4oYtWXto+SaysEnIdC5nrqYeQDv9GCJyN7bU3VlD78g4Y5vUReHJGQP2UvFT95+7vvW0GjVgvITTIjNv+q9H/bDa86TPvfrHU3GAicXkHC1n3zTGU5EAineclEyefNaW6nanZormi58U4+rduhiI1Da657eVrdFQ82L26CVSSOIJmNeyM96O3i3G7X1Gyh5SUBmIgibfk1yIO1U8LW3O2e+p7AZY6vFUgxTWQ3UvdkS39xGH7wrZiXw40ws+5QMLkL4="
                    // errMsg: "getUserInfo:ok"
                    // iv: "Z0Xt9NELS3JPhFXDuyvo0A=="
                    // rawData: "{"nickName":"厚光","gender":1,"language":"zh_CN","city":"太原","province":"山西","country":"中国","avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJvcs9Ue78o5oibVxvxgnibzobtsvFTx8kozI9zxd5ibhbDqhSia6mJ7kcMYshNs42Hvk39Kp9UkhrQVA/132"}"
                    // signature: "c85188faddf4a4dec95a7993b152f35883bb4bd6"
                    wx.login({
                        success: res => {
                            console.log(res)
                            let code = res.code;
                            let post = {
                                code: code,
                                iv: data.iv,
                                encryptedData: data.encryptedData,
                                signature: data.signature
                            };
                            wx.request({
                                url: `${app.api}api/user/login`,
                                method: "POST",
                                data: post,
                                success: res => {
                                    _this.setData({
                                        hideLogin: true
                                    })
                                    console.log("request",res);
                                    res = res.data;
                                    console.log("request",res);
                                    if (res.code === 0) {
                                        wx.setStorage({
                                            data: res.data.user,
                                            key: 'user',
                                            success: res => {
                                                wx.showToast({
                                                    title: '登录成功',
                                                })
                                            }
                                        })
                                        _this.setData({
                                            user: res.data.user
                                        });
                                    } else {
                                        wx.hideLoading()
                                        wx.showModal({
                                            title: "错误",
                                            success: res => {
                                                wx.reLaunch({
                                                    url: '/pages/index/index',
                                                })
                                                return true;
                                            }
                                        })
                                    }
                                }
                            })
                        },
                    })
                }
            })
        } else {
            wx.getUserProfile({
                lang: "zh_CN",
                desc: "用户显示要打印的文件",
                success: data => {
                    wx.login({
                        success: res => {
                            console.log(res)
                            let code = res.code;
                            let post = {
                                code: code,
                                iv: data.iv,
                                encryptedData: data.encryptedData,
                                signature: data.signature
                            };
                            wx.request({
                                url: `${app.api}api/user/login`,
                                method: "POST",
                                data: post,
                                success: res => {
                                    _this.setData({
                                        hideLogin: true
                                    })
                                    console.log("request",res);
                                    res = res.data;
                                    console.log("request",res);
                                    if (res.code === 0) {
                                        wx.setStorage({
                                            data: res.data.user,
                                            key: 'user',
                                            success: res => {
                                                wx.showToast({
                                                    title: '登录成功',
                                                })
                                            }
                                        })
                                        _this.setData({
                                            user: res.data.user
                                        });
                                    } else {
                                        wx.hideLoading()
                                        wx.showModal({
                                            title: "错误",
                                            success: res => {
                                                wx.reLaunch({
                                                    url: '/pages/index/index',
                                                })
                                                return true;
                                            }
                                        })
                                    }
                                }
                            })
                        },
                    })
                }
            })
        }
    },
    scan: function () {
        wx.getStorage({
            key: 'user',
            success: res => {
                wx.scanCode({
                    onlyFromCamera: true,
                    success: res => {
                        let path = decodeURIComponent(res.path);
                        console.log(res, path);
                        let printer_id = 0;
                        let param = path.split(":");
                        console.log(param);
                        if (param.length == 2) {
                            printer_id = param[1];
                        }
                        // console.log(printer_id);
                        this.getPrinter(printer_id);
                        // wx.reLaunch({
                        //     url: `./index?printer_id=${printer_id}`,
                        // })
                    }
                })
            },
            fail: err => {
                this.setData({
                    hideLogin: false
                })
            }
        })
    },
    closeLogin() {
        this.setData({
            hideLogin: true
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
    checkUnPrint() {
        wx.showNavigationBarLoading();
        app.request({
            url: "api/web/unPrintFiles",
            success: res => {
                wx.hideNavigationBarLoading();
                this.setData({
                    unPrint: res.data.data
                })
            }
        })
    }
})