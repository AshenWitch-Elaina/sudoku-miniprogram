// components/sudoku/ui/sudoku.js
const Toolkit = require('../core/toolkit.js');

Component({
  properties: {
    difficulty: {
      type: String,
      value: 'easy'
    }
  },

  data: {
    difficultyName: '简单',
    grid: [],
    original: [],
    solution: [],
    candidates: [],
    noteMode: false,
    selectedRow: -1,
    selectedCol: -1,
    time: 0,
    formattedTime: '00:00',
    timer: null,
    paused: false,
    gameId: null,
    _initialized: false,
    cellClasses: [],
    _gameCompleted: false
  },

  observers: {
    'difficulty': function(newVal) {
      const difficultyMap = { easy: '简单', medium: '中等', hard: '困难', expert: '专家' };
      this.setData({
        difficultyName: difficultyMap[newVal] || '简单'
      });
      if (this.data._initialized) {
        if (this.data.timer) clearInterval(this.data.timer);
        this.setData({ timer: null, paused: false });
        this.initGame();
      }
    }
  },

  lifetimes: {
    attached() {
      this.setData({ _initialized: true });
      this.initGame();
    },
    detached() {
      if (!this.data._gameCompleted) {
        this.saveProgress();
      }
      if (this.data.timer) clearInterval(this.data.timer);
    }
  },

  methods: {
    // 初始化游戏（含类型转换）
    initGame() {
      const difficulty = this.properties.difficulty;
      const saved = wx.getStorageSync(`sudoku_${difficulty}`);

      // 转换 candidates 中所有元素为数字
      const convertCandidatesToNumber = (candidates) => {
        if (!candidates) return this.initCandidatesArray();
        return candidates.map(row => 
          row.map(col => 
            col.map(v => Number(v))
          )
        );
      };

      if (saved && saved.grid && saved.original) {
        const candidates = saved.candidates ? convertCandidatesToNumber(saved.candidates) : this.initCandidatesArray();

        this.setData({
          grid: saved.grid,
          original: saved.original,
          solution: saved.solution,
          candidates: candidates,
          time: saved.time || 0,
          _gameCompleted: false,
          gameId: saved.gameId || Date.now()
        }, () => {
          this.setData({ formattedTime: Toolkit.formatTime(this.data.time) });
          this.updateCellClasses();
          this.startTimer();
        });
        return;
      }

      wx.showLoading({ title: '生成谜题中' });
      this.generateNewPuzzle();
    },

    initCandidatesArray() {
      return Array(9).fill().map(() => Array(9).fill().map(() => []));
    },

    generateNewPuzzle() {
      wx.cloud.callFunction({
        name: 'generatePuzzle',
        data: { difficulty: this.properties.difficulty }
      }).then(res => {
        wx.hideLoading();
        const { puzzle, solution } = res.result;
        this.setupNewGame(puzzle, solution);
      }).catch(err => {
        console.warn('云函数调用失败，使用本地生成', err);
        wx.hideLoading();
        // 简易本地生成（仅供演示，实际应替换）
        const puzzle = this.generateLocalPuzzle();
        const solution = this.getLocalSolution();
        this.setupNewGame(puzzle, solution);
      });
    },

    

    // 本地简易生成（仅用于演示）
    generateLocalPuzzle() {
      const full = [
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
      return full.map(row => row.map(v => Math.random() > 0.5 ? v : 0));
    },

    getLocalSolution() {
      return [
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
    },

    setupNewGame(puzzle, solution) {
      const grid = Toolkit.deepClone(puzzle);
      const original = Toolkit.deepClone(puzzle);
      const candidates = this.initCandidatesArray();
      const gameId = Date.now();
      this.setData({
        grid,
        original,
        solution,
        candidates,
        gameId,
        time: 0,
        formattedTime: '00:00',
        selectedRow: -1,
        selectedCol: -1,
        _gameCompleted: false
      }, () => {
        this.updateCellClasses();
        this.startTimer();
        this.saveProgress();
      });
    },

    updateCellClasses() {
      const rows = 9;
      const cols = 9;
      const cellClasses = [];
      for (let r = 0; r < rows; r++) {
        const rowClasses = [];
        for (let c = 0; c < cols; c++) {
          const originalVal = this.data.original[r]?.[c];
          const gridVal = this.data.grid[r]?.[c];
          if (originalVal !== 0) {
            rowClasses.push('fixed');
          } else if (gridVal !== 0) {
            rowClasses.push('user-filled');
          } else {
            rowClasses.push('');
          }
        }
        cellClasses.push(rowClasses);
      }
      this.setData({ cellClasses });
    },

    startTimer() {
      if (this.data.paused) return;
      if (this.data.timer) clearInterval(this.data.timer);
      const startTime = Date.now() - this.data.time * 1000;
      const timer = setInterval(() => {
        if (this.data.paused) return;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        this.setData({
          time: elapsed,
          formattedTime: Toolkit.formatTime(elapsed)
        });
        this.saveProgress();
      }, 1000);
      this.setData({ timer, startTime });
    },

    togglePause() {
      this.setData({ paused: !this.data.paused });
      if (!this.data.paused) this.startTimer();
    },

    onCellTap(e) {
      const { row, col } = e.currentTarget.dataset;
      this.setData({ selectedRow: row, selectedCol: col });
    },

    onNumberTap(e) {
      const num = e.currentTarget.dataset.num;
      const { selectedRow, selectedCol, original, grid, noteMode } = this.data;
      console.log(`点击格子 [${selectedRow},${selectedCol}] 的 grid 值:`, grid[selectedRow]?.[selectedCol]);

      if (selectedRow === -1 || selectedCol === -1) {
        wx.showToast({ title: '请先选中格子', icon: 'none' });
        return;
      }
      if (original[selectedRow][selectedCol] !== 0) {
        wx.showToast({ title: '初始数字不能修改', icon: 'none' });
        return;
      }

      if (noteMode) {
        // 笔记模式：只在空格上操作
        if (grid[selectedRow][selectedCol] !== 0) {
          wx.showToast({ title: '已有数字的格子不能添加笔记', icon: 'none' });
          return;
        }
        this.toggleCandidate(selectedRow, selectedCol, num);
      } else {
        // 普通模式：填入数字
        const newGrid = Toolkit.deepClone(grid);
        newGrid[selectedRow][selectedCol] = num;
        this.setData({ grid: newGrid }, () => {
          this.updateCellClasses();
          this.checkCompletion();
        });
        this.saveProgress();
      }
    },

    // 核心笔记功能：切换候选数（强制存入数字）
    toggleCandidate(row, col, num) {
      console.log(`传入的 num 类型: ${typeof num}, 值: ${num}`);
      const newCandidates = JSON.parse(JSON.stringify(this.data.candidates));
      const arr = newCandidates[row][col];
      const idx = arr.indexOf(num);
      if (idx > -1) {
        arr.splice(idx, 1);
      } else {
        arr.push(Number(num));  // 确保存入数字
        arr.sort((a, b) => a - b);
      }
      this.setData({ candidates: newCandidates }, () => {
        console.log(`候选数更新 [${row},${col}]:`, this.data.candidates[row][col]);
        this.data.candidates[row][col].forEach(v => console.log(typeof v));
      });
      this.saveProgress();
    },

    eraseCell() {
      const { selectedRow, selectedCol, original, noteMode } = this.data;
      if (selectedRow === -1 || selectedCol === -1) return;
      if (original[selectedRow][selectedCol] !== 0) {
        wx.showToast({ title: '不能擦除初始数字', icon: 'none' });
        return;
      }
      if (noteMode) {
        const newCandidates = JSON.parse(JSON.stringify(this.data.candidates));
        newCandidates[selectedRow][selectedCol] = [];
        this.setData({ candidates: newCandidates });
        wx.showToast({ title: '候选数已清空', icon: 'none' });
      } else {
        const newGrid = Toolkit.deepClone(this.data.grid);
        newGrid[selectedRow][selectedCol] = 0;
        this.setData({ grid: newGrid }, () => {
          this.updateCellClasses();
        });
      }
      this.saveProgress();
    },

    toggleNoteMode() {
      this.setData({ noteMode: !this.data.noteMode });
      wx.showToast({
        title: this.data.noteMode ? '笔记模式' : '数字模式',
        icon: 'none',
        duration: 800
      });
    },

    getHint() {
      const { selectedRow, selectedCol, original, solution, grid } = this.data;
      if (selectedRow === -1 || selectedCol === -1) {
        wx.showToast({ title: '请先选中格子', icon: 'none' });
        return;
      }
      if (original[selectedRow][selectedCol] !== 0) {
        wx.showToast({ title: '初始格子无需提示', icon: 'none' });
        return;
      }
      const correct = solution[selectedRow][selectedCol];
      if (grid[selectedRow][selectedCol] === correct) {
        wx.showToast({ title: '已经正确啦', icon: 'none' });
        return;
      }
      const newGrid = Toolkit.deepClone(grid);
      newGrid[selectedRow][selectedCol] = correct;
      this.setData({ grid: newGrid }, () => {
        this.updateCellClasses();
      });
      this.checkCompletion();
      this.saveProgress();
    },

    checkCompletion() {
      const { grid, solution } = this.data;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] !== solution[r][c]) return;
        }
      }
      this.completeGame();
    },

    completeGame() {
      clearInterval(this.data.timer);
      this.setData({ timer: null, paused: true, _gameCompleted: true });
      wx.showModal({
        title: '恭喜',
        content: `你完成了本次数独！用时 ${this.data.formattedTime}`,
        confirmText: '查看成绩',
        success: (res) => {
          if (res.confirm) {
            this.submitRecord();
          }
          wx.removeStorageSync(`sudoku_${this.properties.difficulty}`);
          this.triggerEvent('gamecomplete', { time: this.data.time });
        }
      });
    },

    submitRecord() {
      wx.cloud.callFunction({
        name: 'submitRecord',
        data: {
          difficulty: this.properties.difficulty,
          timeSpent: this.data.time,
          isWin: true
        }
      }).catch(err => console.error('提交失败', err));
    },

    saveProgress() {
      const key = `sudoku_${this.properties.difficulty}`;
      const data = {
        grid: this.data.grid,
        original: this.data.original,
        solution: this.data.solution,
        candidates: this.data.candidates,
        time: this.data.time,
        gameId: this.data.gameId
      };
      wx.setStorageSync(key, data);
    },

    isSameNumber(row, col) {
      const { selectedRow, selectedCol, grid } = this.data;
      if (selectedRow === -1 || selectedCol === -1) return false;
      const selectedNum = grid[selectedRow][selectedCol];
      if (selectedNum === 0) return false;
      return grid[row][col] === selectedNum;
    },

    resetGame() {
      wx.showModal({
        title: '开始新游戏',
        content: '确定要放弃当前进度，开始新的一局吗？',
        success: (res) => {
          if (res.confirm) {
            // 停止计时器
            if (this.data.timer) {
              clearInterval(this.data.timer);
              this.setData({ timer: null });
            }
            // 清除当前难度的本地存储
            wx.removeStorageSync(`sudoku_${this.properties.difficulty}`);
            // 重置所有游戏数据，并将 _gameCompleted 设为 false
            this.setData({
              grid: [],
              original: [],
              solution: [],
              candidates: this.initCandidatesArray(),
              time: 0,
              formattedTime: '00:00',
              selectedRow: -1,
              selectedCol: -1,
              paused: false,
              noteMode: false,
              _gameCompleted: false
            }, () => {
              wx.showLoading({ title: '生成谜题中' });
              this.generateNewPuzzle();
            });
          }
        }
      });
    }
  }
});