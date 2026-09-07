// pages/rank/rank.js
Page({
  data: {
    difficulties: ['全部', '简单', '中等', '困难', '专家'],
    difficultyMap: ['all', 'easy', 'medium', 'hard', 'expert'],
    difficultyIndex: 0,
    rankList: []
  },

  onLoad() {
    this.loadRank()
  },

  onDifficultyChange(e) {
    const index = e.detail.value
    this.setData({ difficultyIndex: index }, () => {
      this.loadRank()
    })
  },

  loadRank() {
    const difficulty = this.data.difficultyMap[this.data.difficultyIndex]
    wx.showLoading({ title: '加载中' })
    wx.cloud.callFunction({
      name: 'getRank',
      data: { difficulty }
    }).then(res => {
      wx.hideLoading()
      const list = res.result.list || []
      // 格式化时间
      list.forEach(item => {
        const m = Math.floor(item.bestTime / 60).toString().padStart(2, '0')
        const s = (item.bestTime % 60).toString().padStart(2, '0')
        item.formattedTime = `${m}:${s}`
      })
      this.setData({ rankList: list })
    }).catch(err => {
      wx.hideLoading()
      console.error('获取排行榜失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  }
})