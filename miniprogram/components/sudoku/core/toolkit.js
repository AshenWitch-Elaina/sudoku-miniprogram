// components/sudoku/core/toolkit.js
const Toolkit = {
  // 深拷贝二维数组
  deepClone(matrix) {
    return matrix.map(row => [...row]);
  },

  // 初始化候选数三维数组 [9][9][]
  initCandidates() {
    return Array(9).fill().map(() =>
      Array(9).fill().map(() => [])
    );
  },

  // 格式化时间（秒 -> mm:ss）
  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
};

module.exports = Toolkit;