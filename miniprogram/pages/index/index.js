// pages/index/index.js
const app = getApp();

Page({
  data: {
    difficulties: ['简单', '中等', '困难', '专家'],
    difficultyIndex: 0,
    difficultyMap: ['easy', 'medium', 'hard', 'expert']
  },

  onLoad() {
    // 静默获取openid
    if (!app.globalData.openid) {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          app.globalData.openid = res.result.openid;
        },
        fail: console.error
      });
    }
  },

  onDifficultyChange(e) {
    this.setData({ difficultyIndex: e.detail.value });
  },

  startGame() {
    const difficulty = this.data.difficultyMap[this.data.difficultyIndex];
    wx.navigateTo({
      url: `/pages/sudoku/sudoku?difficulty=${difficulty}`
    });
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  goToRank() {
    wx.navigateTo({ url: '/pages/rank/rank' });
  },

  onShareAppMessage() {
    return {
      title: '数独 · 经典数字游戏',
      path: '/pages/index/index'
    };
  }
});