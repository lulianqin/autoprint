const app = getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		currentTab: 0,
		taskList: [{
			id: '0',
			name: '公用文库',
			type: 9001
		}, {
			id: '1',
			name: '私人文库',
			type: 9002
		}],
	},
	homeClick(e) {
		var yid = e.currentTarget.dataset.yid;
		wx.navigateTo({
			url: 'second_level?id=' + yid
		});
	}
})
