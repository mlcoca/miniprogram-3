Page({
  data: {
    notesCount: 0,
    categoriesCount: 0,
    lastBackupTime: ''
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const notes = wx.getStorageSync('notes') || []
    const categories = wx.getStorageSync('categories') || []
    const lastBackupTime = wx.getStorageSync('lastBackupTime')
    
    this.setData({
      notesCount: notes.length,
      categoriesCount: categories.length,
      lastBackupTime: lastBackupTime ? this.formatTime(lastBackupTime) : ''
    })
  },

  formatTime(timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  backupToCloud() {
    wx.showLoading({
      title: '备份中...'
    })
    
    const notes = wx.getStorageSync('notes') || []
    const categories = wx.getStorageSync('categories') || []
    
    // 调用云函数进行备份
    wx.cloud.callFunction({
      name: 'backupData',
      data: {
        notes,
        categories
      },
      success: () => {
        const now = Date.now()
        wx.setStorageSync('lastBackupTime', now)
        this.setData({
          lastBackupTime: this.formatTime(now)
        })
        wx.showToast({
          title: '备份成功'
        })
      },
      fail: (err) => {
        console.error('备份失败：', err)
        wx.showToast({
          title: '备份失败',
          icon: 'error'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  restoreFromCloud() {
    wx.showModal({
      title: '提示',
      content: '从云端恢复将覆盖本地数据，是否继续？',
      success: (res) => {
        if (res.confirm) {
          this.doRestore()
        }
      }
    })
  },

  doRestore() {
    wx.showLoading({
      title: '恢复中...'
    })
    
    wx.cloud.callFunction({
      name: 'restoreData',
      success: (res) => {
        const { notes, categories } = res.result.data
        
        wx.setStorageSync('notes', notes)
        wx.setStorageSync('categories', categories)
        
        this.loadData()
        wx.showToast({
          title: '恢复成功'
        })
      },
      fail: (err) => {
        console.error('恢复失败：', err)
        wx.showToast({
          title: '恢复失败',
          icon: 'error'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  exportData() {
    const notes = wx.getStorageSync('notes') || []
    const categories = wx.getStorageSync('categories') || []
    
    const exportData = {
      notes,
      categories,
      exportTime: new Date().toISOString()
    }
    
    const fileContent = JSON.stringify(exportData, null, 2)
    
    // 保存为文件
    wx.getSavedFileList({
      success: (res) => {
        res.fileList.forEach(file => {
          wx.removeSavedFile({
            filePath: file.filePath
          })
        })
        
        const fileName = `notes_backup_${new Date().getTime()}.json`
        
        wx.getFileSystemManager().writeFile({
          filePath: `${wx.env.USER_DATA_PATH}/${fileName}`,
          data: fileContent,
          encoding: 'utf8',
          success: () => {
            wx.shareFileMessage({
              filePath: `${wx.env.USER_DATA_PATH}/${fileName}`,
              success: () => {
                wx.showToast({
                  title: '导出成功'
                })
              },
              fail: () => {
                wx.showToast({
                  title: '导出失败',
                  icon: 'error'
                })
              }
            })
          }
        })
      }
    })
  }
}) 