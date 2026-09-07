Page({
  data: {
    difficulty: 'easy' // 默认难度，可由上一页传递
  },
  onLoad(options) {
    // 如果从首页带难度参数过来，则使用该难度
    if (options.difficulty) {
      this.setData({ difficulty: options.difficulty });
    }
  },
  onGameComplete(e) {
    // 游戏完成时的回调，例如返回首页或显示成绩
    wx.showToast({
      title: `完成！用时 ${e.detail.time}秒`,
      icon: 'none'
    });
    // 可选择返回上一页
    setTimeout(() => wx.navigateBack(), 1500);
  }
});