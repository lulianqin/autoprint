const app = getApp();
Page({
    data: {
        src: '',
        width: 250, //宽度
        height: 250, //高度,
        disable_rotate: true,
        limit_move: false,
        disable_width: true,
        disable_height: true,
    },
    onLoad: function (options) {
        this.cropper = this.selectComponent("#image-cropper");
    },
    onShow() {
        let size = {
            a4: {
                width: 210,
                height: 297
            },
            id_card: {
                width: 85,
                height: 55
            },
            c1: {
                width: 22,
                height: 32
            },
            c1x: {
                width: 25,
                height: 35,
            },
            c2: {
                width: 35,
                height: 45
            },
            c2x: {
                width: 35,
                height: 50,
            },
            photo: {
                width: 102,
                height: 152
            }
        };
        let windowWidth = wx.getStorageSync('windowWidth');
        wx.getStorage({
            key: 'takePhoto',
            success: res => {
                this.setData({
                    src: res.data.path,
                    width: windowWidth * 0.8,
                    height: size[res.data.size]["height"] / size[res.data.size]["width"] * (windowWidth * 0.8),
                    size: res.data.size,
                    process: res.data.process || "",
                    printer_id: res.data.printer_id || 0,
                })
            }
        })
    },
    cropperload(e) {
        console.log("cropper初始化完成");
    },
    loadimage(e) {
        console.log("图片加载完成", e.detail);
        this.setData({
            file: e.detail
        })
        wx.hideLoading();
        this.cropper.imgReset();
    },
    clickcut(e) {
        return;
        console.log(e.detail);
        if (this.data.process === "Photoedit" && this.data.printer_id > 0) {
            let file = {
                path: e.detail.url,
                printer_id: this.data.printer_id,
                process: "photo"
            };
            app.upload(file).then(res => {
                if (res.code == 0) {
                    //编辑成功
                    wx.showToast({
                        title: '操作成功',
                        mask: true,
                    })
                    setTimeout(_ => {

                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 500)
                } else {
                    wx.showToast({
                        title: res.msg,
                        mask: true,
                        icon: "none"
                    })
                }
            }, err => {
                console.log(err);
                wx.showModal({
                    title: "错误",
                    content: "操作失败"
                })
            })
        } else {

            wx.setStorage({
                data: {
                    path: e.detail.url,
                    done: true,
                    size: this.data.size,
                },
                key: 'takePhoto',
                success: _ => {
                    //wx.previewImage({
                    //    urls: [e.detail.url],
                    //    current: e.detail.url
                    //})
                    wx.navigateBack({
                        delta: 1,
                    })
                }
            })
        }
    },
    confirm() {
        this.cropper.getImg((obj) => {
            //height: 1480.659
            //url: "http://tmp/wx2069e516b6eab071.o6zAJs5j7Vl504u9j5PW9Tlgfl8A.RlNMU055fPv1d5a4031f637dac261369bf0d45ec2b42.png"
            //width: 993.5999999999999

            let url = obj.url;

            if (this.data.process === "Photoedit" && this.data.printer_id > 0) {
                let file = {
                    path: url,
                    printer_id: this.data.printer_id,
                    process: "photo"
                };
                app.upload(file).then(res => {
                    if (res.code == 0) {
                        //编辑成功
                        wx.showToast({
                            title: '操作成功',
                            mask: true,
                        })
                        //更新上一页
                        var pages = getCurrentPages();
                        if (pages.length > 1) {
                            var prePage = pages[pages.length - 2];
                            prePage.onLoad()
                        }
                        setTimeout(_ => {

                            wx.navigateBack({
                                delta: 1,
                            })
                        }, 500)
                    } else {
                        wx.showToast({
                            title: res.msg,
                            mask: true,
                            icon: "none"
                        })
                    }
                }, err => {
                    console.log(err);
                    wx.showModal({
                        title: "错误",
                        content: "操作失败"
                    })
                })
            } else {

                wx.setStorage({
                    data: {
                        path: url,
                        done: true,
                        size: this.data.size,
                    },
                    key: 'takePhoto',
                    success: _ => {
                        //wx.previewImage({
                        //    urls: [e.detail.url],
                        //    current: e.detail.url
                        //})
                        wx.navigateBack({
                           delta: 1,
                        })
                    }
                })
            }
        });
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