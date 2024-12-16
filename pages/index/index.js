// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const { formatTime } = require('../../utils/util.js')

Page({
  data: {
    notes: [],
    currentTag: 'all'
  },

  onShow() {
    this.loadNotes()
  },

  loadNotes(tag = 'all') {
    const notes = wx.getStorageSync('notes') || []
    const filteredNotes = tag === 'all' ? notes : notes.filter(note => note.category === tag)
    const formattedNotes = filteredNotes.map(note => ({
      ...note,
      createTime: formatTime(new Date(note.createTime)),
      categoryName: this.getCategoryName(note.category)
    }))
    this.setData({ notes: formattedNotes })
  },

  getCategoryName(category) {
    const categoryMap = {
      'work': '工作',
      'life': '生活',
      'study': '学习',
      'other': '其他'
    }
    return categoryMap[category] || ''
  },

  createNote() {
    wx.navigateTo({
      url: '/pages/edit/edit'
    })
  },

  createImageNote() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles
        wx.navigateTo({
          url: '/pages/edit/edit?type=image&images=' + JSON.stringify(tempFiles)
        })
      }
    })
  },

  createLinkNote() {
    wx.navigateTo({
      url: '/pages/edit/edit?type=link'
    })
  },

  editNote(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/edit/edit?id=${id}`
    })
  },

  goToBackup() {
    wx.navigateTo({
      url: '/pages/backup/backup'
    })
  },

  onImageError(e) {
    console.error('图片加载失败:', e.detail.errMsg)
    const src = e.currentTarget.dataset.src
    console.log('片路径:', src)
  },

  shareNote(e) {
    const note = e.currentTarget.dataset.note
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  copyNote(e) {
    const note = e.currentTarget.dataset.note
    const text = `${note.title}\n\n${note.content}`
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  deleteNote(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除提示',
      content: '确定要删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          const notes = wx.getStorageSync('notes') || []
          const newNotes = notes.filter(n => n.id !== id)
          wx.setStorageSync('notes', newNotes)
          this.loadNotes()
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  onShareAppMessage(res) {
    if (res.from === 'button') {
      const note = res.target.dataset.note
      return {
        title: note.title || '分享一个笔记',
        path: '/pages/share/share?id=' + note.id
      }
    }
    return {
      title: '推荐一个好用的极速笔记小程序',
      path: '/pages/index/index'
    }
  },

  switchTag(e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ currentTag: tag })
    this.loadNotes(tag)
  }
})
