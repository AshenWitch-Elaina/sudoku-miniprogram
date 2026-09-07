// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // 环境 ID，请确保与云开发控制台的一致
      env: "cloud1-5gphdprgaa51066f",
    };
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env, // 直接使用变量，去掉引号
        traceUser: true,
      });
    }
  },
});