const app = getApp();

Page({
	data: {
		currentTab: 0,
		taskList: [],
		xjWjjName: "",
		showUpPop: false,
		xxm: 1,
		xjjId: 0,
		uppop_title: "新建文件夹"
	},
	onLoad(open) {
		this.setData({
			currentTab: open.id
		});
		this.get_wenku_ytype_list(this.data.currentTab);
	},
	listClick(e) {
		var yid = e.currentTarget.dataset.yid;
		wx.navigateTo({
			url: 'tertiary?ytype=' + yid + '&stype=' + this.data.currentTab
		});
	},
	tapAdd() {
		this.setData({
			xxm: 1,
			uppop_title: "新建文件夹"
		});
		this.UpPopQh(true);
	},

	tapquxiao() {
		this.UpPopQh(false);
	},
	tapqueren() {
		if (this.data.xjWjjName) {
			if (this.data.xxm == 1) {
				this.get_wenku_ytype_add(this.data.xjWjjName);
			} else if (this.data.xxm == 2) {
				this.get_wenku_ytype_exit(this.data.xjjId, this.data.xjWjjName);
			}
		} else {
			wx.showToast({
				icon: "none",
				title: '请输入正确格式的文件名称',
			});
		}
	},
	UpPopQh(showUpPop) {
		this.setData({
			showUpPop: showUpPop,
			xjWjjName: ""
		});
	},
	setNameText: function(e) {
		this.setData({
			xjWjjName: e.detail.value
		});
	},
	get_wenku_ytype_exit(id, name) {

		wx.showLoading({
			title: '加载中...',
			mask: true,
		});
		var _this = this;
		app.request({
			url: "api/buy/get_wenku_ytype_exit",
			data: {
				id: id,
				name: name
			},
			method: "POST",
			success: res => {
				wx.hideLoading();
				res = res.data;
				if (res.code == "0") {
					wx.showToast({
						icon: "none",
						title: '修改成功',
					});
					_this.UpPopQh(false);
					_this.get_wenku_ytype_list(this.data.currentTab);
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
			}
		});
	},
	get_wenku_ytype_add(name) {
		wx.showLoading({
			title: '加载中...',
			mask: true,
		});
		var _this = this;
		app.request({
			url: "api/buy/get_wenku_ytype_add",
			data: {
				name: name
			},
			method: "POST",
			success: res => {
				wx.hideLoading();
				res = res.data;
				if (res.code == "0") {
					wx.showToast({
						icon: "none",
						title: '添加成功',
					});
					_this.UpPopQh(false);
					_this.get_wenku_ytype_list(this.data.currentTab);
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
			}
		});

	},
	sc_bin(e) {
		var id = e.currentTarget.dataset.yid;
		var _this = this;
		wx.showModal({
			title: '提示',
			content: '目录下所有文件将会一起删除且不可找回，是否继续删除？',
			success(res) {
				if (res.confirm) {
					wx.showLoading({
						title: '加载中...',
						mask: true,
					});
					app.request({
						url: "api/buy/get_wenku_ytype_sc",
						data: {
							id: id
						},
						method: "POST",
						success: datas => {
							var res = datas.data;
							if (res.code == 0) {
								wx.showToast({
									title: '删除成功',
									icon: 'none'
								});
								_this.get_wenku_ytype_list(_this.data.currentTab);
							} else {
								wx.showToast({
									title: res.msg,
									icon: 'none'
								});
							}

						}
					});
				}
			}
		});
	},
	get_cmm(e) {
		var id = e.currentTarget.dataset.yid;
		this.setData({
			xjjId: id,
			xxm: 2,
			uppop_title: "文件夹重命名"
		});
		this.UpPopQh(true);
		return;
	},
	get_wenku_ytype_list(type) {
		wx.showLoading({
			title: '加载中...',
			mask: true,
		});
		var _this = this;
		app.request({
			url: "api/buy/get_wenku_ytype_list",
			data: {
				type: type
			},
			method: "POST",
			success: res => {
				wx.hideLoading();
				res = res.data;
				if (res.code == "0") {
					let data = res.data;
					_this.setData({
						taskList: data,
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
			}
		});
	},
})
