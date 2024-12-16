Page({
  data: {
    autoBackup: false,
    useEncryption: true,
    intervalIndex: 0,
    intervals: ['每天', '每周', '每月']
  },

  onLoad() {
    const settings = wx.getStorageSync('backupSettings') || {}
    this.setData({
      autoBackup: settings.autoBackup || false,
      useEncryption: settings.useEncryption !== false,
      intervalIndex: settings.intervalIndex || 0
    })
  },

  toggleAutoBackup(e) {
    const autoBackup = e.detail.value
    this.setData({ autoBackup })
    this.saveSettings()
    
    if (autoBackup) {
      this.setupAutoBackup()
    } else {
      this.clearAutoBackup()
    }
  },

  toggleEncryption(e) {
    this.setData({
      useEncryption: e.detail.value
    })
    this.saveSettings()
  },

  onIntervalChange(e) {
    this.setData({
      intervalIndex: parseInt(e.detail.value)
    })
    this.saveSettings()
    
    if (this.data.autoBackup) {
      this.setupAutoBackup()
    }
  },

  saveSettings() {
    const { autoBackup, useEncryption, intervalIndex } = this.data
    wx.setStorageSync('backupSettings', {
      autoBackup,
      useEncryption,
      intervalIndex
    })
  },

  setupAutoBackup() {
    const intervals = [24, 168, 720] // 小时数：1天、1周、1月
    const hours = intervals[this.data.intervalIndex]
    
    wx.setBackgroundFetchToken({
      token: 'backup_token'
    })
    
    wx.setBackgroundFetchInterval({
      interval: hours * 60 * 60 // 转换为秒
    })
  },

  clearAutoBackup() {
    wx.removeBackgroundFetchToken({
      token: 'backup_token'
    })
  }
}) 