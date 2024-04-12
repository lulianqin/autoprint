const app = getApp();
Page({
    data: {
        ext: {
            jpeg: {
                icon: "../../images/JPG@2x.png",
                color: "#6CE4D8"
            },
            jpg: {
                icon: "../../images/JPG@2x.png",
                color: "#6CE4D8"
            },
            png: {
                icon: "../../images/PNG@2x.png",
                color: "#FFD93B"
            },
            xls: {
                icon: "../../images/XLSX@2x.png",
                color: "#9ED463"
            },
            xlsx: {
                icon: "../../images/XLSX@2x.png",
                color: "#9ED463"
            },
            ppt: {
                icon: "../../images/PPT@2x.png",
                color: "#F8A53B"
            },
            pptx: {
                icon: "../../images/PPT@2x.png",
                color: "#F8A53B"
            },
            pdf: {
                icon: "../../images/PDF@2x.png",
                color: "#EF427C"
            },
            doc: {
                icon: "../../images/DOC@2x.png",
                color: "#5E7EE8"
            },
            docx: {
                icon: "../../images/DOC@2x.png",
                color: "#5E7EE8"
            }
        },
        printer_name:"未选择打印机"
    },
    onLoad: function (options) {

    },
    onShow: function () {
        this.getPrintLists();
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
    //获取打印列表
    getPrintLists(callback = null) {
        wx.showLoading({
            title: '加载中...',
        })
        app.request({
            url: "api/printer/waitPrinting",
            success: res => {
                wx.hideLoading()
                console.log(res.data);
                if (res.data.data.length == 0) {
                    wx.showToast({
                        title: '暂无待打印文件',
                        icon: "none",
                        mask: true,
                    })
                    setTimeout(_ => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 600)
                } else {
                    this.setData({
                        lists: res.data.data
                    });
                }
            }
        })
    },
    preview(e) {
        wx.showLoading({
            title: '正在打开...',
            mask: true,
        })
        let index = e.currentTarget.dataset.index;
        let file = this.data["lists"][index];
        let ext = file["filename"].split(".").pop().toLowerCase();
        wx.downloadFile({
            url: file.file,
            success: res => {
                wx.hideLoading();
                switch (ext) {
                    case "doc":
                    case "docx":
                    case "xls":
                    case "xlsx":
                    case "ppt":
                    case "pptx":
                    case "pdf":
                        wx.openDocument({
                            filePath: res.tempFilePath,
                        })
                        break;
                    case "jpg":
                    case "png":
                    case "jpeg":
                        wx.previewImage({
                            urls: [res.tempFilePath],
                            current: res.tempFilePath
                        })
                        break;
                    default:
                        wx.showToast({
                            title: '文件类型不支持预览',
                            icon: "none",
                            mask: true,
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