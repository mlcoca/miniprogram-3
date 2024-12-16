// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 初始化云开发
    wx.cloud.init({
      env: 'your-env-id',
      traceUser: true
    })

    // 处理自动备份
    this.handleAutoBackup()
  },
  globalData: {
    userInfo: null
  },
  handleAutoBackup() {
    wx.getBackgroundFetchToken({
      token: 'backup_token',
      success: () => {
        const settings = wx.getStorageSync('backupSettings') || {}
        if (settings.autoBackup) {
          const lastBackup = wx.getStorageSync('lastBackupTime') || 0
          const intervals = [24, 168, 720] // 小时数：1天、1周、1月
          const hours = intervals[settings.intervalIndex || 0]
          
          if (Date.now() - lastBackup >= hours * 60 * 60 * 1000) {
            // 需要执行备份
            const notes = wx.getStorageSync('notes') || []
            const categories = wx.getStorageSync('categories') || []
            
            wx.cloud.callFunction({
              name: 'backupData',
              data: { notes, categories }
            }).then(() => {
              wx.setStorageSync('lastBackupTime', Date.now())
            })
          }
        }
      }
    })
  }
})
