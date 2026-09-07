// components/sudoku/core/sudoku.js
const Toolkit = require('./toolkit.js');
const Generator = require('./generator.js');
const Checker = require('./checker.js');

class Sudoku {
  constructor() {
    this.generator = new Generator();
    this.checker = new Checker();
  }

  // 生成谜题（本地备用）
  generate(difficulty) {
    return this.generator.generate(difficulty);
  }

  // 根据 original 和 grid 计算单元格类名（fixed / user-filled）
  getCellClass(originalVal, gridVal) {
    if (originalVal !== 0) return 'fixed';
    if (gridVal !== 0) return 'user-filled';
    return '';
  }

  // 生成整个单元格类名矩阵
  generateCellClasses(original, grid) {
    const rows = 9;
    const cols = 9;
    const cellClasses = [];
    for (let r = 0; r < rows; r++) {
      const rowClasses = [];
      for (let c = 0; c < cols; c++) {
        rowClasses.push(this.getCellClass(original[r]?.[c], grid[r]?.[c]));
      }
      cellClasses.push(rowClasses);
    }
    return cellClasses;
  }

  // 切换候选数（添加或移除）
  toggleCandidate(candidates, row, col, num) {
    const newCandidates = Toolkit.deepClone(candidates);
    const arr = newCandidates[row][col];
    const idx = arr.indexOf(num);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(num);
      arr.sort((a, b) => a - b);
    }
    return newCandidates;
  }

  // 清空指定格子的所有候选数
  clearCellCandidates(candidates, row, col) {
    const newCandidates = Toolkit.deepClone(candidates);
    newCandidates[row][col] = [];
    return newCandidates;
  }

  // 检查是否完成（与答案对比）
  isCompleted(grid, solution) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== solution[r][c]) return false;
      }
    }
    return true;
  }

  // 校验填入的数字是否合法（针对当前盘面）
  isValid(grid, row, col, num) {
    return this.checker.isValid(grid, row, col, num);
  }
}

module.exports = Sudoku;