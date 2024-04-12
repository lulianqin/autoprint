const app = getApp()

// pages/wode/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideLogin: true,
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  zt(e) {
    let url = e.currentTarget.dataset.url;
    console.log(url);
    wx.navigateTo({
      url: '../' + url + '/index',
    })
  },
  getUserInfo: function () {
    let that = this

    wx.getStorage({
      key: 'user',
      success: res1 => {
        that.setData({
          userInfo: res1.data
        });
      },
      fail: err => {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        that.setData({
          hideLogin: false
        });
        return;
      }
    });


  },
  login_user: function () {
    let _this = this;
    wx.showLoading({
      title: '登录中...',
      mask: true
    })
    if (typeof wx.getUserProfile == "undefined") {
      //pc端小程序不支持新接口
      console.log('getUserInfo')
      wx.getUserInfo({
        lang: 'zh_CN',
        success: data => {
          wx.login({
            success: res => {
              let code = res.code;
              let post = {
                code: code,
                iv: data.iv,
                encryptedData: data.encryptedData,
                signature: data.signature
              };
              wx.request({
                url: `${app.api}/api/user/login`,
                method: "POST",
                data: post,
                success: res => {
                  _this.setData({
                    hideLogin: true
                  })
                  res = res.data;
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
                      userInfo: res.data.user
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
        desc: "用户信息查询",
        success: data => {
          wx.login({
            success: res => {
              let code = res.code;
              let post = {
                code: code,
                iv: data.iv,
                encryptedData: data.encryptedData,
                signature: data.signature
              };
              wx.request({
                url: `${app.api}/api/user/login`,
                method: "POST",
                data: post,
                success: res => {
                  _this.setData({
                    hideLogin: true
                  });
                  res = res.data;
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
                      userInfo: res.data.user
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
})