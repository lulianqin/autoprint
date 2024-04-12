const app = getApp();
Page({
    data: {
        src:`${app.api}/api/web/index`
    },
    onLoad: function (options) {
        console.log(options)
        this.options = options;
    },
    onShow: function () {
        wx.getStorage({
            key: 'user',
            success: res => {
                wx.getStorage({
                    key:"printer",
                    success:res1=>{
                        this.setData({
                            user: res.data,
                            src:`${app.api}/api/web/index/uid/${res.data.id}/page_type/${this.options.page_type}/printer_id/${res1.data.id}`
                        })
                    }
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
    },
})