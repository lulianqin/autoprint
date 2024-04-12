const app = getApp()

Page({
  data: {
    isRefresh: false,
    currentTab: 0,
    taskList: [{
      name: '已购文库'
    }],
    or_list: [],
    d_page: 1,
    z_page: 0,
    wudingdao: true
  },
  onShow() {
    // this.get_wenku_list();
  },
  onLoad() {
    this.get_wenku_list();
  },
  handleClick(e) {
    let currentTab = e.currentTarget.dataset.index
    this.setData({
      currentTab
    })
  },
  handleSwiper(e) {
    let {
      current,
      source
    } = e.detail
    if (source === 'autoplay' || source === 'touch') {
      const currentTab = current
      this.setData({
        currentTab
      })
    }
  },
  handleTolower(e) {
    if (this.data.d_page >= this.data.z_page) {
      wx.showToast({
        title: '到底啦'
      })
    } else {
      this.setData({
        d_page: this.data.d_page + 1
      });
      this.get_wenku_list();
    }
  },
  refresherpulling() {
    wx.showLoading({
      title: '刷新中'
    })
    this.setData({
      or_list: [],
      d_page: 1,
      z_page: 0
    });
    this.get_wenku_list(1);
  },
  get_bin(e) {
    var id = e.currentTarget.dataset.yid;

    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    var _this = this;
    app.request({
      url: "api/buy/get_wenku_dy_st",
      data: {
        id: id
      },
      method: "POST",
      success: res => {
        wx.hideLoading();
        res = res.data;
        console.log(res);
        if (res.code == "200") {
          wx.navigateTo({
            url: '../wenku_zs/index?id=' + id,
          })
        } else if (res.code == "0") {
          wx.requestPayment(Object.assign(res.data.config, {
            success: _ => {
              //3秒后查询支付结果
              wx.showLoading({
                title: '查询支付结果...',
              })
              setTimeout(_ => {
                app.request({
                  url: "api/buy/getStatus",
                  data: {
                    order_id: res.data.order_id,
                  },
                  success: r => {
                    console.log("查询支付结果", r)
                    let res = r.data;
                    if (res.code === 0) {
                      wx.navigateTo({
                        url: '../wenku_zs/index?id=' + id,
                      })
                    } else {
                      //未支付
                      wx.showModal({
                        title: "提示",
                        content: res.msg,
                      })
                    }
                  }
                })
              }, 3000)
            },
            fail: err => {
              wx.hideLoading();
              wx.showToast({
                icon: "none",
                title: '支付失败',
              })
            }
          }))
        } else {
          wx.showModal({
            title: "错误",
            content: res.msg,
            success: _ => {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showModal({
          title: "错误",
          content: res.msg,
          success: _ => {
            wx.navigateBack({
              delta: 1,
            })
          }
        })
      }
    })
  },
  get_wenku_list(type = 0) {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    var _this = this;
    app.request({
      url: "api/buy/get_yg_wenku_list",
      data: {
        page: _this.data.d_page
      },
      method: "POST",
      success: res => {
        wx.hideLoading();
        res = res.data;
        console.log(res);
        if (type == 1) {
          _this.setData({
            isRefresh: false
          })
          wx.showToast({
            title: '加载完成'
          })
        }
        if (res.code == "0") {
          let data = res.data;
          if (data.total > 0) {
            if (_this.data.or_list == []) {
              _this.setData({
                or_list: data.data,
                z_page: data.last_page,
                wudingdao: true

              });
            } else {
              _this.setData({
                or_list: _this.data.or_list.concat(data.data),
                z_page: data.last_page,
                wudingdao: true
              });
            }
          } else {
            _this.setData({
              wudingdao: false
            })
          }
        } else {
          wx.showModal({
            title: "错误",
            content: res.msg,
            success: _ => {
              wx.navigateBack({
                delta: 1,
              })
            }
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showModal({
          title: "错误",
          content: res.msg,
          success: _ => {
            wx.navigateBack({
              delta: 1,
            })
          }
        })
      }
    })

  },

})