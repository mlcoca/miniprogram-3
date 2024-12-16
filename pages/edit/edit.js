Page({
  data: {
    noteId: '',
    title: '',
    content: '',
    category: '',
    categoryName: '',
    isModified: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ noteId: options.id })
      this.loadNote(options.id)
    }
  },

  onUnload() {
    if (this.data.isModified) {
      this.saveNote()
    }
  },

  onCancel() {
    if (this.data.isModified) {
      wx.showModal({
        title: '提示',
        content: '是否保存当前编辑的内容？',
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            this.saveNote()
          } else {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  onTitleInput(e) {
    this.setData({
      title: e.detail.value,
      isModified: true
    })
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value,
      isModified: true
    })
  },

  selectCategory() {
    wx.showActionSheet({
      itemList: ['工作', '生活', '学习', '其他'],
      success: (res) => {
        const categories = ['work', 'life', 'study', 'other']
        const names = ['工作', '生活', '学习', '其他']
        this.setData({
          category: categories[res.tapIndex],
          categoryName: names[res.tapIndex],
          isModified: true
        })
      }
    })
  },

  loadNote(id) {
    const notes = wx.getStorageSync('notes') || []
    const note = notes.find(n => n.id === id)
    if (note) {
      this.setData({
        title: note.title,
        content: note.content
      })
    }
  },

  saveNote(callback) {
    const { noteId, title, content, category } = this.data
    
    if (!title.trim() && !content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    const notes = wx.getStorageSync('notes') || []
    const now = Date.now()

    if (noteId) {
      // 更新已存在的笔记
      const index = notes.findIndex(n => n.id === noteId)
      if (index > -1) {
        notes[index] = {
          ...notes[index],
          title,
          content,
          category,
          updateTime: now
        }
      }
    } else {
      // 创建新笔记
      notes.unshift({
        id: now.toString(),
        title,
        content,
        category,
        createTime: now,
        updateTime: now
      })
    }

    wx.setStorageSync('notes', notes)
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      if (callback) {
        callback()
      } else {
        wx.navigateBack()
      }
    }, 1500)
  },

  deleteNote() {
    const { noteId } = this.data
    wx.showModal({
      title: '提示',
      content: '确定要删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          const notes = wx.getStorageSync('notes') || []
          const newNotes = notes.filter(n => n.id !== noteId)
          wx.setStorageSync('notes', newNotes)
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        }
      }
    })
  },

  addImage() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles
        // 处理选中的图片
        const images = tempFiles.map(file => file.tempFilePath)
        // 将图片路径插入到内容中
        const content = this.data.content + '\n' + images.map(img => `![图片](${img})`).join('\n')
        this.setData({
          content,
          isModified: true
        })
      }
    })
  },

  addLink() {
    wx.showModal({
      title: '添加链接',
      placeholderText: '请输入链接地址',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          // 将链接插入到内容中
          const content = this.data.content + '\n' + res.content
          this.setData({
            content,
            isModified: true
          })
        }
      }
    })
  },

  showSaveConfirm() {
    wx.showModal({
      title: '保存提示',
      content: '是否保存当前编辑的内容？',
      confirmText: '保存',
      cancelText: '不保存',
      success: (res) => {
        if (res.confirm) {
          this.saveNote()
        } else {
          wx.navigateBack()
        }
      }
    })
  },

  onImageError(e) {
    console.error('图片加载失败:', e.detail.errMsg)
  },

  goToHome() {
    if (this.data.isModified) {
      wx.showModal({
        title: '提示',
        content: '是否保存当前编辑的内容？',
        confirmText: '保存',
        cancelText: '不保存',
        success: (res) => {
          if (res.confirm) {
            this.saveNote(() => {
              wx.switchTab({
                url: '/pages/index/index'
              })
            })
          } else {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }
        }
      })
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}) 