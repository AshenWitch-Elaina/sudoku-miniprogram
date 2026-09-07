// 云函数 generatePuzzle
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 预置完整终盘（可扩展多个终盘）
const BASE_SOLUTION = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
]

// 各难度挖洞数量（挖掉的格子数）
const HOLE_COUNTS = {
  easy: 35,
  medium: 45,
  hard: 52,
  expert: 58
}

/**
 * 生成一个唯一解的数独谜题（简单挖洞，不保证唯一解，仅示例）
 * 实际生产环境建议使用更严谨的算法或题库
 */
function generatePuzzle(difficulty) {
  const solution = JSON.parse(JSON.stringify(BASE_SOLUTION))
  const puzzle = JSON.parse(JSON.stringify(BASE_SOLUTION))
  const holeCount = HOLE_COUNTS[difficulty] || 40

  let count = 0
  while (count < holeCount) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0
      count++
    }
  }
  return { puzzle, solution }
}

exports.main = async (event, context) => {
  const { difficulty = 'easy' } = event
  try {
    const { puzzle, solution } = generatePuzzle(difficulty)
    return { puzzle, solution }
  } catch (err) {
    console.error(err)
    return { error: err.message }
  }
}