# 数独小游戏

一款基于微信小程序开发的数独游戏，支持难度选择、计时、自动生成题库等完整功能。

> 本项目为毕业设计作品，源码完全开源，仅供学习参考。

---

## 技术栈

- 微信小程序（WXML / WXSS / JavaScript）
- 微信云开发（云数据库 / 云函数）
- 原生 JavaScript 实现数独生成与求解算法

---

## 核心功能

- **四种难度选择**：简单 / 中等 / 困难 / 专家，满足不同水平玩家
- **数字填充与候选笔记模式**：支持正常填入和笔记标记，辅助推理
- **自动计时与用时记录**：精确记录每局游戏耗时，可暂停/继续
- **胜负判定与完成提示**：自动检测完成，弹窗展示成绩
- **数独题库随机生成与自动求解**：确保每次开局谜题不同，提示功能可显示正确数字
- **游戏进度保存**：本地缓存 + 云开发数据库双重保障，退出后进度不丢失
- **个人中心**：游戏数据统计（总对局、完成数、完成率）、各难度最佳成绩、历史战绩列表
- **排行榜**：按难度筛选，展示前 100 名用户的最快完成时间及完成次数
- **进度自动保存**：游戏过程中实时保存，随时中断后继续

---

## 项目结构

```
sudoku-miniprogram/
├── miniprogram/                  # 小程序前端代码
│   ├── pages/                    # 页面
│   │   ├── index/                # 首页（难度选择、开始游戏）
│   │   ├── sudoku/               # 游戏主界面
│   │   ├── profile/              # 个人中心
│   │   └── rank/                 # 排行榜
│   ├── components/               # 自定义组件
│   │   └── sudoku/               # 数独棋盘组件（核心）
│   │       ├── core/             # 数独生成、校验、工具类
│   │       └── ui/               # 组件界面（wxml/wxss/js/wxs）
│   ├── images/                   # 图片资源
│   ├── app.js / app.json / app.wxss
│   └── ...
├── cloudfunctions/               # 云函数
│   ├── login/                    # 获取用户 openid
│   ├── generatePuzzle/           # 生成数独谜题（支持难度）
│   ├── submitRecord/             # 提交游戏记录
│   └── getRank/                  # 获取排行榜数据
├── project.config.json           # 项目配置文件
└── README.md
```

---

## 运行方式

### 前置条件
- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（最新稳定版）
- 拥有微信小程序 AppID（可申请测试号）

### 步骤

1. **克隆本项目到本地**
   ```bash
   git clone https://github.com/AshenWitch-Elaina/sudoku-miniprogram.git
   ```

2. **使用微信开发者工具导入项目**，目录选择项目根目录，填入你的 AppID（测试号也可）。

3. **配置云开发环境**  
   - 在开发者工具中点击“云开发”开通云环境，获取环境 ID。
   - 打开 `miniprogram/app.js`，将 `env` 值改为你的云环境 ID。
   ```javascript
   wx.cloud.init({
     env: 'your-env-id',  // 替换为实际 ID
     traceUser: true,
   });
   ```

4. **部署云函数**  
   在 `cloudfunctions` 目录下，分别右键点击 `login`、`generatePuzzle`、`submitRecord`、`getRank` 四个文件夹，选择 **“上传并部署：云端安装依赖”**。

5. **创建数据库集合**  
   在云开发控制台的“数据库”中，创建两个集合：`users`（用户信息）和 `game_records`（游戏记录）。

6. **编译运行**  
   点击“编译”在模拟器预览，或点击“预览”生成二维码在真机上体验。

---

## ⚠️ 注意事项

- **微信用户授权**：本项目当前采用**模拟用户数据**演示个人中心和排行榜，原因是毕业设计期间未完成小程序备案和隐私保护指引配置。如需正式上线，请在微信公众平台完成相关资质审核并启用 `wx.getUserProfile`。
- **云函数依赖**：务必使用“云端安装依赖”方式上传，否则会出现 `wx-server-sdk` 缺失错误。
- **基础库版本**：推荐 ≥ 2.19.0，以支持 `wx.getUserProfile` 和 CSS `backdrop-filter` 效果。

---

## 开发者

- AshenWitch-Elaina
- 2026年4月

---

## 项目链接

- GitHub：https://github.com/AshenWitch-Elaina/sudoku-miniprogram

---

## 参考文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [数独算法参考](https://www.101computing.net/sudoku-generator-algorithm/)

---

## 许可证

本项目采用 [MIT License](LICENSE) 开源协议。