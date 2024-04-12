const app = getApp();
Page({
    data: {

    },
    onLoad: function (options) {
        wx.chooseImage({
            count: 1,
            success: res => {
                let data = {
                    size: "a4",
                    path: res.tempFiles[0]["path"]
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
            }
        })
    },
    onShow: function () {
        wx.getStorage({
            key: 'takePhoto',
            success: res => {
                if (res.data.done) {
                    let file = {
                        path: res.data.path,
                        page_type: 1,
                        filename: "拍照扫描.jpg",
                        doc_type: 2,
                        print_type: 5,
                    };
                    app.upload(file).then(res => {
                        wx.removeStorage({
                            key: 'takePhoto',
                            success: _ => {
                                wx.redirectTo({
                                    url: '../print_list/index?type=sc',
                                })
                            }
                        })
                    }, err => {

                    })

                }
            }
        })
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