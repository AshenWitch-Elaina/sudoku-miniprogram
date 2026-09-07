// 云函数 submitRecord
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { difficulty, timeSpent, isWin, steps = 0 } = event

  try {
    const result = await db.collection('game_records').add({
      data: {
        openid: wxContext.OPENID,
        difficulty,
        timeSpent,
        isWin,
        steps,
        createTime: db.serverDate()
      }
    })
    return { success: true, id: result._id }
  } catch (err) {
    console.error(err)
    return { success: false, error: err.message }
  }
}