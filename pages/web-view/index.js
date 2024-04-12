Page({
    data: {

    },
    onLoad: function (options) {
        console.log(options)
        wx.getStorage({
            key: 'user',
            success: res => {
                let uid = res.data.id;
                this.setData({
                    src: `${options.src}/printer_id/${options.printer_id}/uid/${uid}`
                })
            },
            fail: err => {
                this.setData({
                    hideLogin: false
                })
            }
        })

    },
    onShow: function () {

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