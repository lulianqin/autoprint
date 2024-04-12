const app = getApp();
Page({
    data: {
        src1: "../../images/icon_card_2.png",
        src2: "../../images/icon_card_1.png",
        hideSide1: false,
        hideSide2: false,

        printer_name:"未选择打印机"
    },
    onLoad: function (options) {

    },
    onShow: function () {
        //已选择图片
        if (typeof this.data.side !== "undefined") {
            wx.getStorage({
                key: 'takePhoto',
                success: res => {
                    console.log(res)
                    //照片裁切完成返回
                    if (res.data.done) {
                        let side = this.data.side;
                        let file = {
                            filename: `身份证${side}`,
                            path: res.data.path,
                            process: "id_card"
                        };
                        app.upload(file).then(res => {
                            this.setData({
                                [`src${side}`]: res.data.savename,
                                [`hideSide${side}`]: true,
                            });
                            wx.removeStorageSync('takePhoto');
                        }, err => {
                            wx.showModal({
                                content: "上传失败"
                            })
                        })
                    }
                }
            })
        }

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
                    this.setData({ video: data.video });
                }
                if (typeof data.interstitial !== "undefined" && data.interstitial !== "") {
                    //插屏广告
                    this.setData({ interstitial: data.interstitial });
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
    },
    idCardSelect(e) {
        let side = e.currentTarget.dataset.side;
        this.setData({
            side: side
        })
        wx.chooseImage({
            count: 1,
            success: res => {
                wx.setStorage({
                    data: {
                        path: res.tempFiles[0]["path"],
                        size: "id_card",
                        done: false,
                    },
                    key: 'takePhoto',
                    success: _ => {
                        wx.navigateTo({
                            url: '../photo_resize/index',
                        })
                    }
                })
            }
        })
    },
    //合成身份证
    process() {
        if (this.data.hideSide1 && this.data.hideSide2) {
            wx.showLoading({
                title: '正在合成图片...',
                mask: true,
            })
            app.request({
                url: "api/upload/idCard",
                data: {
                    src1: this.data.src1,
                    src2: this.data.src2,
                    doc_type:3,
                },
                method: "POST",
                success: res => {
                    wx.hideLoading()
                    console.log("合成身份证", res.data.data);
                    
                    wx.showToast({
                        title: '操作成功',
                        success: _ => {
                            wx.redirectTo({
                                url: '../print_list/index?type=sc',
                            })
                        }
                    })
                },
                fail: err => {
                    wx.hideLoading()
                    wx.showModal({
                        title: "错误",
                        content: err.msg
                    })
                }
            })

        } else {
            wx.showToast({
                title: '请上传身份证',
                mask: true,
                icon: "none"
            })
        }
    },
    onShareAppMessage(){
        let share = {};
        wx.getStorage({
          key: 'share',
          success:res=>{
              let mini = res.data.mini;
              share = {
                  title:mini.title,
                  path:"/pages/index/index",
                  imageUrl:mini.image,
              }
          }
        })
        return share;
    },
    onShareTimeline(){
        let share = {};
        wx.getStorage({
          key: 'share',
          success:res=>{
              let momnet = res.data.momnet;
              share = {
                  title:momnet.title,
                  query:{
                      printer_id:this.data.printer.id||0
                  },
                  imageUrl:momnet.image,
              }
          }
        })
        return share;
    }
})