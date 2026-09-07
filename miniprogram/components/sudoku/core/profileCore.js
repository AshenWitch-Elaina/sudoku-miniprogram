// components/sudoku/core/profileCore.js
const db = wx.cloud.database()

/**
 * 获取用户 openid（通过云函数 login）
 * @returns {Promise<string>}
 */
function getOpenid() {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'login',
      success: res => resolve(res.result.openid),
      fail: reject
    })
  })
}

/**
 * 保存用户信息到 users 集合
 * @param {string} openid 
 * @param {object} userInfo - 包含 nickName, avatarUrl
 * @returns {Promise}
 */
function saveUserToDB(openid, userInfo) {
  const users = db.collection('users')
  return users.where({ openid }).get().then(res => {
    if (res.data.length === 0) {
      return users.add({
        data: {
          openid,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          createTime: db.serverDate()
        }
      })
    } else {
      return users.doc(res.data[0]._id).update({
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      })
    }
  })
}

/**
 * 加载用户的游戏记录
 * @param {string} openid 
 * @returns {Promise<Array>} 记录数组
 */
function loadGameRecords(openid) {
  return db.collection('game_records')
    .where({ openid })
    .orderBy('createTime', 'desc')
    .get()
    .then(res => res.data)
}

/**
 * 计算统计数据
 * @param {Array} records 
 * @returns {object} { totalGames, totalWins, winRate, bestTimes }
 */
function calculateStats(records) {
  const totalGames = records.length
  const totalWins = records.filter(r => r.isWin).length
  const winRate = totalGames ? Math.round(totalWins / totalGames * 100) : 0

  const bestTimes = {}
  const difficulties = ['easy', 'medium', 'hard', 'expert']
  difficulties.forEach(d => {
    const best = records
      .filter(r => r.difficulty === d && r.isWin)
      .reduce((min, r) => Math.min(min, r.timeSpent), Infinity)
    if (best !== Infinity) {
      const m = Math.floor(best / 60).toString().padStart(2, '0')
      const s = (best % 60).toString().padStart(2, '0')
      bestTimes[d] = `${m}:${s}`
    } else {
      bestTimes[d] = null
    }
  })

  return { totalGames, totalWins, winRate, bestTimes }
}

/**
 * 格式化历史记录（用于展示）
 * @param {Array} records 
 * @returns {Array} 格式化后的历史记录
 */
function formatHistory(records) {
  const difficultyNames = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' }
  return records.slice(0, 20).map(r => {
    const date = new Date(r.createTime)
    const dateStr = `${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2,'0')}`
    const m = Math.floor(r.timeSpent / 60).toString().padStart(2, '0')
    const s = (r.timeSpent % 60).toString().padStart(2, '0')
    return {
      difficultyName: difficultyNames[r.difficulty] || r.difficulty,
      createTime: dateStr,
      formattedTime: `${m}:${s}`,
      isWin: r.isWin
    }
  })
}

module.exports = {
  getOpenid,
  saveUserToDB,
  loadGameRecords,
  calculateStats,
  formatHistory
}