// pages/profile/profile.js
const app = getApp()
const ProfileCore = require('../../components/sudoku/core/profileCore.js')

Page({
  data: {
    userInfo: {},
    openidShort: '',
    stats: {
      totalGames: 0,
      totalWins: 0,
      winRate: 0,
      bestTimes: {}
    },
    history: [],
    difficultyMap: [
      { name: '简单', value: 'easy' },
      { name: '中等', value: 'medium' },
      { name: '困难', value: 'hard' },
      { name: '专家', value: 'expert' }
    ],
    requesting: false // 防止重复请求
  },

  onShow() {
    this.checkLoginStatus()
  },

  // 检查登录状态
  async checkLoginStatus() {
    if (app.globalData.userInfo) {
      this.setData({ userInfo: app.globalData.userInfo })
      await this.ensureOpenid()
      this.loadUserData()
    } else {
      // 没有用户信息，只尝试获取 openid（用于匿名统计）
      await this.ensureOpenid()
    }
  },

  // 确保 openid 存在（获取并保存到全局）
  async ensureOpenid() {
    if (app.globalData.openid) {
      this.setData({ openidShort: app.globalData.openid.slice(0, 8) + '...' })
      return
    }
    try {
      const openid = await ProfileCore.getOpenid()
      app.globalData.openid = openid
      this.setData({ openidShort: openid.slice(0, 8) + '...' })
    } catch (err) {
      console.error('获取openid失败', err)
    }
  },

  // 微信登录获取用户信息（由按钮触发）
  async getUserProfile() {
    if (this.data.requesting) return
    this.setData({ requesting: true })

    try {
      const res = await this.getUserProfilePromise()
      const userInfo = res.userInfo
      app.globalData.userInfo = userInfo
      this.setData({ userInfo, requesting: false })

      // 确保 openid 已获取，然后保存用户信息
      await this.ensureOpenid()
      await ProfileCore.saveUserToDB(app.globalData.openid, userInfo)
      this.loadUserData()
    } catch (err) {
      console.error('获取用户信息失败', err)
      wx.showToast({ title: '授权失败', icon: 'none' })
      this.setData({ requesting: false })
    }
  },

  // 将 wx.getUserProfile 封装为 Promise
  getUserProfilePromise() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于展示用户信息',
        success: resolve,
        fail: reject
      })
    })
  },

  // 加载用户游戏数据
  async loadUserData() {
    if (!app.globalData.openid) return

    try {
      const records = await ProfileCore.loadGameRecords(app.globalData.openid)
      const stats = ProfileCore.calculateStats(records)
      const history = ProfileCore.formatHistory(records)
      this.setData({ stats, history })
    } catch (err) {
      console.error('加载用户数据失败', err)
    }
  }
})