// components/sudoku/core/generator.js
const Toolkit = require('./toolkit.js');

class Generator {
  constructor() {
    // 预置一个完整终盘（可从网上获取标准终盘，这里简写）
    this.baseSolution = [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ];
  }

  // 根据难度挖洞生成题目
  generate(difficulty) {
    const puzzle = Toolkit.deepClone(this.baseSolution);
    const holes = { easy: 35, medium: 45, hard: 52, expert: 58 }[difficulty] || 40;
    let count = 0;
    while (count < holes) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        count++;
      }
    }
    return {
      puzzle: puzzle,
      solution: Toolkit.deepClone(this.baseSolution)
    };
  }
}

module.exports = Generator;