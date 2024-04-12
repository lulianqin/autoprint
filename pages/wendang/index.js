const app = getApp()

Page({
	data: {
		isRefresh: false,
		taskTypeList: [{
			name: '全部',
			id: 0
		}],
		TypeC: 0,
		or_list: [],
		d_page: 1,
		z_page: 0,
		wudingdao: true,
		uid: 0,
		option: 0
	},
	onShow() {
		this.get_wenku_list(1, 1);
	},
	onLoad() {
		var _this = this;
		wx.getStorage({
			key: 'user',
			success: res => {
				this.setData({
					uid: res.data.id
				});
			}
		});
		this.get_wenku_ytype_list();
	},
	handleClick(e) {
		let currentTab = e.currentTarget.dataset.index;
		this.setData({
			currentTab
		});

		this.setData({
			or_list: [],
			d_page: 1,
			z_page: 0
		});
		this.get_wenku_list(1);
	},
	handleTypeClick(e) {
		let TypeC = e.currentTarget.dataset.index;
		this.setData({
			TypeC
		});
		this.setData({
			or_list: [],
			d_page: 1,
			z_page: 0
		});
		this.get_wenku_list(1);
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
	sc_bin(e) {
		var id = e.currentTarget.dataset.yid;
		wx.showModal({
			title: '提示',
			content: '删除后不可找回，是否继续删除？',
			success(res) {
				if (res.confirm) {
					wx.showLoading({
						title: '加载中...',
						mask: true,
					});
					var _this = this;
					app.request({
						url: "api/buy/sc_wenku",
						data: {
							id: id
						},
						method: "POST",
						success: datas => {
							var res = datas.data;
							if (res.code == 0) {
								wx.showToast({
									title: '删除成功',
									icon: 'none',
									duration: 2000
								});
								_this.get_wenku_list();
							} else {
								wx.showToast({
									title: res.msg,
									icon: 'none',
									duration: 2000
								});
							}

						}
					});
				}
			}
		});
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
												url: '../wenku_zs/index?id=' +
													id,
											})
										} else {
											//未支付
											wx.showModal({
												title: "提示",
												content: res
													.msg,
											});
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
	tapUp() {
		var _this = this;
		if (_this.data.currentTab == 0) {
			wx.showModal({
				title: '提示',
				content: '公共文库上传需通过管理员审核后才能看到，确认继续上传？',
				success(res) {
					if (res.confirm) {
						wx.navigateTo({
							url: '../web-view/wenku_up?type=' + _this.data.currentTab,
						});
					}
				}
			});
		} else if (this.data.currentTab == 1) {
			wx.navigateTo({
				url: '../web-view/wenku_up?type=' + _this.data.currentTab,
			});
		}
	},
	get_wenku_ytype_list() {
		wx.showLoading({
			title: '加载中...',
			mask: true,
		});
		var _this = this;
		app.request({
			url: "api/buy/get_wenku_ytype_list",
			data: {},
			method: "POST",
			success: res => {
				wx.hideLoading();
				res = res.data;
				if (res.code == "0") {
					let data = res.data;
					_this.setData({
						taskTypeList: _this.data.taskTypeList.concat(data),
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
	get_wenku_list(type = 0, sxtype = 0) {
		wx.showLoading({
			title: '加载中...',
			mask: true,
		})
		var _this = this;
		var ytype = _this.data.taskTypeList[_this.data.TypeC].id;
		app.request({
			url: "api/buy/get_wenku_list",
			data: {
				ytype: ytype,
				type: _this.data.currentTab,
				page: _this.data.d_page
			},
			method: "POST",
			success: res => {
				wx.hideLoading();
				res = res.data;
				if (type == 1) {
					_this.setData({
						isRefresh: false
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
							var orlist = _this.data.or_list.concat(data.data);
							if (sxtype == 1) {
								orlist = data.data;
							}
							_this.setData({
								or_list: orlist,
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
