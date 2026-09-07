// components/sudoku/core/checker.js
class Checker {
  // 检查在指定位置填入数字是否合法（不依赖答案）
  isValid(grid, row, col, num) {
    // 检查行
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false;
    }
    // 检查列
    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false;
    }
    // 检查宫
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[boxRow + r][boxCol + c] === num) return false;
      }
    }
    return true;
  }
}

module.exports = Checker;