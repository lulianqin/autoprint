const app = getApp();
Page({
    data: {
        width: {
            c1: 130,
            c1x: 148,
            c2: 206,
            c2x: 208,
        },
        hideDownloadBtn: true,
        hideBuyBtn: false,
        myStyle: `
        --meiyan_zhi_co: #6e6e6e;
        --meiyan_wu_co: #4A74EE;
        `,
        x: 0,
        //测试数据,实际项目中引入自己的数据
        nav_list: [{
            brand_id: 0,
            brand_name: "背景"
        }, {
            brand_id: 1,
            brand_name: "换装"
        }, {
            brand_id: 2,
            brand_name: "美颜"
        }],
        huanzhuan_list: {
            nan: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            nv: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
            tong: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        },
        huanzhuang_data: {
            xz_id: 0,
            xz_name: "applet_boy",
            xz_zhuang: 0,
            index_nan: false,
            index_nv: true,
            index_tong: true
        },
        co_list: [{
                name: "蓝",
                co: "background:#6495ED",
                y: "1",
                xy: "4",
                r: "10",
                xr: "13"
            },
            {
                name: "白",
                co: "background:#FFFFFF",
                y: "2",
                xy: "5",
                r: "11",
                xr: "14"
            },
            {
                name: "红",
                co: "background:#DC143C",
                y: "3",
                xy: "6",
                r: "12",
                xr: "15"
            },
        ],
        index_beijin: false,
        index_huanzhuan: true,
        index_meiyan: true,
        brand_id: 0,
        dq_cc: 'y',
        savename: '',
        img_data: {
            chicun_id: 0,
            zhuang_id: "",
            meiyan_i: 0
        }
    },
    onLoad: function (options) {

    },
    onShow: function () {
        wx.getStorage({
            key: 'id_photo',
            success: res => {
                let data = res.data;
                this.data.btn = data.btn;
                if (data.btn === 1) {
                    this.setData({
                        photo_thumb: data.photo,
                        photo_template: data.url,
                        size: data.size,
                        btn: 1
                    })
                }
                if (data.btn === 2) {
                    console.log(data)
                    this.setData({
                        photo_thumb: data.file_single_water.url,
                        photo_template: data.file_print_water.url,
                        btn: 2,
                        file_name_wm: data.file_name_wm,
                        file_name: data.file_name,
                        file_name_print: data.file_name_print,
                        size: data.s_name,
                    })
                }
                this.data.savename = data.file_name_y;
                this.setData({
                    ['img_data.chicun_id']: data.spec_id
                });
                if (data.spec_id == 1) {
                    this.data.dq_cc = "y";
                }
                if (data.spec_id == 4) {
                    this.data.dq_cc = "xy";
                }
                if (data.spec_id == 10) {
                    this.data.dq_cc = "r";
                }
                if (data.spec_id == 13) {
                    this.data.dq_cc = "xr";
                }
            },
            fail: err => {
                wx.showModal({
                    title: "错误",
                    content: "照片不存在",
                    success: _ => {
                        wx.reLaunch({
                            url: '../index/index',
                        })
                    }
                })
            }
        })
        this.getElectronicPrice();

    },
    xz_zhuang_bin(e) {
        let did = e.currentTarget.dataset.did;
        if (did == 1) {
            this.setData({
                ['huanzhuang_data.index_nan']: false,
                ['huanzhuang_data.index_nv']: true,
                ['huanzhuang_data.index_tong']: true,
                ['huanzhuang_data.xz_name']: "applet_boy",
                ['huanzhuang_data.xz_zhuang']: 1,
            });
        }
        if (did == 2) {
            this.setData({
                ['huanzhuang_data.index_nan']: true,
                ['huanzhuang_data.index_nv']: false,
                ['huanzhuang_data.index_tong']: true,
                ['huanzhuang_data.xz_name']: "applet_girl",
                ['huanzhuang_data.xz_zhuang']: 2,
            });
        }
        if (did == 3) {
            this.setData({
                ['huanzhuang_data.index_nan']: true,
                ['huanzhuang_data.index_nv']: true,
                ['huanzhuang_data.index_tong']: false,
                ['huanzhuang_data.xz_name']: "applet_kid",
                ['huanzhuang_data.xz_zhuang']: 3,
            });
        }
    },
    meiyan_btn(e) {
        let index = e.currentTarget.dataset.pid;
        console.log(index);
        if (index == 0) {
            this.setData({
                myStyle: `
            --meiyan_zhi_co: #6e6e6e;
            --meiyan_wu_co: #4A74EE;
            `
            });
        }
        if (index == 1) {
            this.setData({
                myStyle: `
            --meiyan_zhi_co: #4A74EE;
            --meiyan_wu_co: #6e6e6e;
            `
            });
        }

        this.setData({
            ['img_data.meiyan_i']: index
        });
        if (this.data.img_data.zhuang_id != "") {
            var post_data = {
                savename: this.data.savename,
                spec_id: this.data.img_data.chicun_id,
                clothes: this.data.img_data.zhuang_id,
                meiyan: index,
                type: 1
            };
            var s_url = "api/upload/huanzhuan";
        } else {
            var post_data = {
                savename: this.data.savename,
                spec_id: this.data.img_data.chicun_id,
                meiyan: index,
                type: 1
            };
            var s_url = "api/upload/makeCertPhoto";
        }
        wx.showLoading({
            title: '正在加载...',
            mask: true,
        })
        app.request({
            url: s_url,
            data: post_data,
            success: res => {
                wx.hideLoading();
                let data = res.data.data;
                this.setData({
                    photo_thumb: data.file_single_water.url,
                    photo_template: data.file_print_water.url,
                    file_name_wm: data.file_name_wm,
                    file_name: data.file_name,
                    file_name_print: data.file_name_print,
                })
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
    zhuang_bin(e) {
        let index = e.currentTarget.dataset.index;
        if (index > 0) {
            let zhuang_name = this.data.huanzhuang_data.xz_name + index.toString();
            this.setData({
                ['img_data.zhuang_id']: zhuang_name
            });
            var post_data = {
                savename: this.data.savename,
                spec_id: this.data.img_data.chicun_id,
                clothes: zhuang_name,
                meiyan: this.data.img_data.meiyan_i,
                type: 1
            };
            var s_url = "api/upload/huanzhuan";
        } else {
            this.setData({
                ['img_data.zhuang_id']: ""
            });
            var post_data = {
                savename: this.data.savename,
                spec_id: this.data.img_data.chicun_id,
                meiyan: this.data.img_data.meiyan_i,
                type: 1
            };
            var s_url = "api/upload/makeCertPhoto";
        }
        wx.showLoading({
            title: '正在加载...',
            mask: true,
        })
        app.request({
            url: s_url,
            data: post_data,
            success: res => {
                wx.hideLoading();
                let data = res.data.data;
                this.setData({
                    photo_thumb: data.file_single_water.url,
                    photo_template: data.file_print_water.url,
                    file_name_wm: data.file_name_wm,
                    file_name: data.file_name,
                    file_name_print: data.file_name_print,
                })
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
    bj_set(e) {
        let index = e.currentTarget.dataset.index;
        let s_id = this.data.co_list[index][this.data.dq_cc];
        this.setData({
            ['img_data.chicun_id']: s_id
        });
        if (this.data.img_data.zhuang_id != "") {
            var post_data = {
                savename: this.data.savename,
                spec_id: s_id,
                clothes: this.data.img_data.zhuang_id,
                meiyan: this.data.img_data.meiyan_i,
                type: 1
            };
            var s_url = "api/upload/huanzhuan";
        } else {
            var post_data = {
                savename: this.data.savename,
                spec_id: s_id,
                meiyan: this.data.img_data.meiyan_i,
                type: 1
            };
            var s_url = "api/upload/makeCertPhoto";
        }
        wx.showLoading({
            title: '正在加载...',
            mask: true,
        })
        app.request({
            url: s_url,
            data: post_data,
            success: res => {
                wx.hideLoading();
                let data = res.data.data;
                this.setData({
                    photo_thumb: data.file_single_water.url,
                    photo_template: data.file_print_water.url,
                    file_name_wm: data.file_name_wm,
                    file_name: data.file_name,
                    file_name_print: data.file_name_print,
                })
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
    getElectronicPrice() {
        app.request({
            url: "api/index/getElectronicPhoto",
            success: res => {
                this.setData({
                    electronic_price: res.data.data.price
                })
            }
        })
    },
    switchTap(e) {
        let screenWidth = wx.getSystemInfoSync().windowWidth;

        let itemWidth = screenWidth / 5;

        let {
            index,
            id
        } = e.currentTarget.dataset;

        const {
            nav_list
        } = this.data;

        let scrollX = itemWidth * index - itemWidth * 2;

        let maxScrollX = (nav_list.length + 1) * itemWidth;

        if (scrollX < 0) {
            scrollX = 0;
        } else if (scrollX >= maxScrollX) {
            scrollX = maxScrollX;
        }
        console.log(id)

        if (id == 0) {
            this.setData({
                index_beijin: false,
                index_huanzhuan: true,
                index_meiyan: true
            });
        }
        if (id == 1) {
            this.setData({
                index_beijin: true,
                index_huanzhuan: false,
                index_meiyan: true
            });
        }
        if (id == 2) {
            this.setData({
                index_beijin: true,
                index_huanzhuan: true,
                index_meiyan: false
            });
        }
        this.setData({
            x: scrollX,
            brand_id: id
        })
    },
    //确认照片
    confirm() {
        wx.showLoading({
            title: '正在提交...',
            mask: true,
        })
        app.request({
            url: "api/upload/confirmIdCardPhoto",
            data: {
                photo_thumb: this.data.photo_thumb,
                photo_template: this.data.photo_template,
                size: this.data.size,
                doc_type: 5,
            },
            method: "POST",
            success: res => {
                wx.hideLoading();
                if (res.statusCode === 200) {
                    console.log(res);
                    wx.removeStorageSync('id_photo')
                    wx.showToast({
                        title: res.data.msg
                    })
                    if (res.data.code == 0) {
                        setTimeout(_ => {
                            wx.redirectTo({
                                url: '../print_list/index?type=sc',
                            })
                        }, 300)
                    }
                } else {
                    wx.showModal({
                        title: "错误",
                        content: "服务器错误",
                        confirmText: "复制错误",
                        success: _ => {
                            if (_.confirm) {
                                wx.setClipboardData({
                                    data: res.data,
                                })
                            }
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
    //购买无水印证件照
    buy() {
        wx.showLoading({
            title: '正在支付...',
        })
        app.request({
            url: "api/buy/electronicPhoto",
            success: res => {
                console.log(res);
                let result = res.data;
                if (result.code === 0) {

                    /**
                     * appId: "wx2069e516b6eab071"
                     * nonceStr: "5f2583d9b8882"
                     * package: "prepay_id=wx0123014570320862973653cd1942317100"
                     * paySign: "B2C0638AC3E8A7A37687022CB3FAECE5"
                     * signType: "MD5"
                     * timeStamp: "1596294105"
                     */
                    wx.requestPayment(Object.assign(result.data.config, {
                        success: _ => {
                            //3秒后查询支付结果
                            wx.showLoading({
                                title: '查询支付结果...',
                            })
                            setTimeout(_ => {
                                app.request({
                                    url: "api/buy/getStatus",
                                    data: {
                                        order_id: result.data.order_id,
                                    },
                                    success: r => {
                                        console.log("查询支付结果", r)
                                        let res = r.data;
                                        if (res.code === 0) {
                                            //支付成功
                                            this.getNoWaterPhoto(res.data.id);
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
                    wx.hideLoading();
                    wx.showModal({
                        title: "错误",
                        content: result.msg,
                    })
                }
            },
            fail: err => {
                wx.hideLoading();
                wx.showModal({
                    title: "错误",
                    content: "购买错误",
                })
            }
        })
    },
    getNoWaterPhoto(order_id) {
        wx.showLoading({
            title: '获取无水印照片...',
        })
        app.request({
            url: "api/upload/getNoWaterPhoto",
            data: {
                filename: this.data.file_name,
                order_id: order_id,
                hz_type: this.data.img_data.zhuang_id ? 1 : 0
            },
            success: res => {
                wx.hideLoading()
                console.log(res.data)
                this.setData({
                    hideDownloadBtn: false,
                    photo_thumb: res.data.data.file_name,
                    photo_template: res.data.data.file_name_list,
                    hideBuyBtn: true,
                })
            },
            fail: err => {
                wx.hideLoading()
                wx.showModal({
                    title: "提示",
                    content: err.msg
                })
            }
        })
    },
    //下载无水印照片
    downPhoto(e) {
        let btn = e.currentTarget.dataset.btn;
        console.log(this.data);
        let url = "";
        if (btn == 1) {
            //下载单张
            url = this.data.photo_thumb;
        } else {
            //下载多张
            url = this.data.photo_template;
        }
        wx.showLoading({
            title: '正在下载',
            mask: true,
        })
        wx.downloadFile({
            url: url,
            success: res => {
                wx.hideLoading();
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: _ => {
                        wx.showToast({
                            title: '已保存到相册',
                        })
                    },
                    fail: err => {
                        wx.showModal({
                            title: "提示",
                            content: "保存失败"
                        })
                    }
                })
            }
        })
    },
    //复制下载链接
    copyPhotoUrl(e) {
        let btn = e.currentTarget.dataset.btn;
        let url = "";
        if (btn == 1) {
            url = this.data.photo_thumb;
        } else {
            url = this.data.photo_template
        }
        wx.setClipboardData({
            data: url,
            success: _ => {
                wx.showToast({
                    title: '复制成功',
                })
            },
            fail: _ => {
                wx.showToast({
                    title: '复制失败',
                    icon: "none"
                })
            }
        })
    }
})