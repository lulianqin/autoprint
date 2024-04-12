const app = getApp()

Page({
  data: {
    hideSetting: true,
    isRefresh: false,
    currentTab: 0,
    taskList: [{
      name: '打印订单'
    }],
    or_list: [],
    d_page: 1,
    z_page: 0,
    wudingdao: true
  },
  onLoad() {
    this.get_or_list();
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
      this.get_or_list();
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
    this.get_or_list(1);
  },
  get_or_list(type = 0) {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    var _this = this;
    app.request({
      url: "api/buy/get_or_list",
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
                z_page: data.last_page
              });
            } else {
              _this.setData({
                or_list: _this.data.or_list.concat(data.data),
                z_page: data.last_page
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
  onContact: function (t) {
    var e = t.currentTarget.dataset.phone;
    console.log(t);
    wx.makePhoneCall({
      phoneNumber: e
    });
  },
  onRefund: function (t) {
    
    let e = t.currentTarget.dataset.jobId;
    console.log(e);
    this.setData({
      jobId: e,
      re_msg: "",
      hideSetting: false
    });
  },
  close: function () {
    this.setData({
      hideSetting: true
    });
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  btnHover: function () {
    let data = {
      jobId: this.data.jobId,
      msg: this.data.inputValue
    }
    app.request({
      url: "api/buy/applyrefund",
      data: data,
      method: "POST",
      success: res => {
        console.log(res);
        wx.showToast({
          title: res.data.msg,
          mask: true,
          duration: 2000,
        })
        if (res.data.code == 1) {
          this.setData({
            or_list: [],
            d_page: 1,
            z_page: 0
          });
          this.get_or_list(1);
        }
      }
    });
    this.setData({
      hideSetting: true
    });
    console.log("this", this);
  },
})