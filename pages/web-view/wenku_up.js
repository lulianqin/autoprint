const app = getApp();
Page({
	data: {
		src: `${app.api}api/web/wenku`
	},
	onLoad: function(options) {
		this.options = options;
		console.log(options);
	},
	onShow: function() {
		wx.getStorage({
			key: 'user',
			success: res => {
				this.setData({
					user: res.data,
					src: `${app.api}api/web/wenku/uid/${res.data.id}/type/${this.options.type}/ytype/${this.options.ytype}`
				});
			},
			fail: err => {
				wx.showToast({
					title: '未登录',
					icon: "none",
					mask: true,
				});
				setTimeout(_ => {
					wx.reLaunch({
						url: "../index/index"
					});
				}, 500);
			}
		})
	},
})
