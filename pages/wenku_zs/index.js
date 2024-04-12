const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    printer_name: "未选择打印机",
    wd_id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      wd_id: options.id
    });
    this.get_wendang_info();
  },
  onShow: function () {
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
  },
  yulan() {
    this.openDocument(this.data.wd_data.wk_url, this.get_type(this.data.wd_data.type));
  },
  daying() {

    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    var _this = this;
    app.request({
      url: "api/upload/wenku_dy",
      data: {
        id: _this.data.wd_id
      },
      method: "POST",
      success: res => {
        wx.hideLoading();
        res = res.data;
        console.log(res);
        if (res.code == "200") {

          wx.redirectTo({
            url: '../print_list/index?type=sc',
          })
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
  get_type(int, type = 0) {
    if (int == 1) {
      if (type == 1) return '/images/ico/word.png';
      return 'doc';
    }
    if (int == 2) {
      if (type == 1) return '/images/ico/word.png';
      return 'docx';
    }
    if (int == 3) {
      if (type == 1) return '/images/ico/excel.png';
      return 'xls';
    }
    if (int == 4) {
      if (type == 1) return '/images/ico/excel.png';
      return 'xlsx';
    }
    if (int == 5) {
      if (type == 1) return '/images/ico/ppt.png';
      return 'ppt';
    }
    if (int == 6) {
      if (type == 1) return '/images/ico/ppt.png';
      return 'pptx';
    }
    if (int == 7) {
      if (type == 1) return '/images/ico/pdf.png';
      return 'pdf';
    }
  },
  get_wendang_info() {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    var _this = this;
    app.request({
      url: "api/buy/get_wenku_find",
      data: {
        id: _this.data.wd_id
      },
      method: "POST",
      success: res => {
        wx.hideLoading();
        res = res.data;
        console.log(res);
        if (res.code == "0") {
          this.setData({
            wd_data: res.data
          });
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
  openDocument(fileUrl, filetype) {
    wx.downloadFile({
      url: fileUrl,
      success: res => {
        const filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          fileType: filetype,
          success: function (res) {
            // console.log("打开文档成功")
          },
          fail: function (res) {
            wx.showToast({
              title: '打开文档失败',
              icon: 'none',
              duration: 2000
            })
          },
        })
      },
      fail: res => {
        console.log(res);
      },
    });
  }
})