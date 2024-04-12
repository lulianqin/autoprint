const IV = 'houguang';
const KEY = 'houguang#sina.cn';
App({
    host: "https://api.521svip.cn/",
    api: "https://api.521svip.cn/",
    onLaunch: function () {
        wx.getSystemInfo({
            success: (result) => {
                wx.setStorageSync('windowWidth', result.windowWidth);
                wx.setStorageSync('windowHeight', result.windowHeight);
            },
        })
        this.getShare();
        this.getAd();
    },
    getShare() {
        this.request({
            url: "api/index/share",
            success: res => {
                wx.setStorage({
                    data: res.data.data,
                    key: 'share',
                })
            }
        })
    },
    getAd() {
        this.request({
            url: "api/index/ad",
            success: res => {
                wx.setStorage({
                    data: res.data.data,
                    key: 'ad',
                })
            }
        })
    },
    request(param = {}, login = true, debug = false) {
        if (login === true) {

            wx.getStorage({
                key: 'user',
                success: res => {
                    let uid = res.data.id;
                    param.data = Object.assign(param.data || {}, {
                        uid: uid
                    });
                    //param.data = this.encrypt(JSON.stringify(param.data));
                    param.url = `${this.api}/${param.url}`;
                    debug && console.log(param);
                    wx.request(param);
                },
                fail: err => {
                    wx.showToast({
                        title: '未登录',
                        icon: "none",
                        mask: true,
                        duration: 200,
                    });
                    var pages = getCurrentPages();
                    if (typeof pages[0] !== "undefined" && (pages[0]["route"] !== "pages/index/index")) {
                        setTimeout(_ => {
                            wx.redirectTo({
                                url: '/pages/index/index',
                            })
                        }, 500)
                    }
                }
            })
        } else {
            param.url = `${this.api}/${param.url}`;
            debug && console.log(param)
            wx.request(param);
        }
    },
    encrypt(str) {
        var key = CryptoJS.enc.Utf8.parse(KEY);
        var iv = CryptoJS.enc.Utf8.parse(IV);
        var encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    },
    decrypt(str) {
        var key = CryptoJS.enc.Utf8.parse(KEY);
        var iv = CryptoJS.enc.Utf8.parse(IV);
        var decrypted = CryptoJS.AES.decrypt(str, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    },
    //上传文件
    upload(file, printer_id) {
        wx.showLoading({
            title: '正在上传...',
            mask: true
        })
        let user = wx.getStorageSync('user');
        let page_type = wx.getStorageSync('page_type');
        return new Promise((resolve, reject) => {
            let path = file.path;
            delete file["path"];
            let formData = Object.assign({
                uid: user.id || 0,
                page_type: page_type || 1,
                printer_id: printer_id,
            }, file);
            console.log("发送的数据", formData);
            wx.uploadFile({
                filePath: path,
                name: "file",
                formData: formData,
                url: `${this.api}/api/upload/file`,
                success: res => {
                    wx.hideLoading();
                    console.log("上传成功", res);
                    res = JSON.parse(res.data);
                    if (res.code === 0) {

                        resolve(res);
                    } else {
                        console.log("err", res)
                        reject(res);
                    }
                },
                fail: err => {
                    wx.hideLoading();
                    console.log("上传错误", err);
                    reject(JSON.stringify(err))
                }
            })
        })
    },
    //数组删除指定元素
    remove: function (array,val) {
        for (var i = 0 ; i < array.length ; i++){
            if (array[i] == val) {
                array.splice(i, 1);
                return array;
            }
        }
        return -1;
    },
})