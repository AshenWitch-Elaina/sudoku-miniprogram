// 云函数 getRank
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { difficulty = 'all' } = event
  const wxContext = cloud.getWXContext()

  try {
    let match = { isWin: true }
    if (difficulty !== 'all') {
      match.difficulty = difficulty
    }

    const rankResult = await db.collection('game_records')
      .aggregate()
      .match(match)
      .group({
        _id: '$openid',
        bestTime: $.min('$timeSpent'),
        count: $.sum(1)
      })
      .sort({ bestTime: 1 })
      .limit(100)
      .end()

    const rankList = rankResult.list
    if (rankList.length === 0) {
      return { list: [] }
    }

    const openids = rankList.map(item => item._id)
    const usersResult = await db.collection('users')
      .where({
        openid: $.in(openids)
      })
      .field({
        openid: true,
        nickName: true,
        avatarUrl: true
      })
      .get()

    const usersMap = {}
    usersResult.data.forEach(user => {
      usersMap[user.openid] = user
    })

    const list = rankList.map((item, index) => {
      const user = usersMap[item._id] || { nickName: '未知用户', avatarUrl: '' }
      return {
        rank: index + 1,
        openid: item._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        bestTime: item.bestTime,
        count: item.count
      }
    })

    return { list }
  } catch (err) {
    console.error(err)
    return { error: err.message }
  }
}