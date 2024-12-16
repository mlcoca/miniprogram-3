Page({
  data: {
    categories: [],
    newCategory: ''
  },

  onShow() {
    this.loadCategories()
  },

  loadCategories() {
    const categories = wx.getStorageSync('categories') || []
    const notes = wx.getStorageSync('notes') || []
    
    // 计算每个分类下的笔记数量
    const categoriesWithCount = categories.map(category => ({
      ...category,
      count: notes.filter(note => note.category === category.id).length
    }))
    
    this.setData({
      categories: categoriesWithCount
    })
  },

  onInputChange(e) {
    this.setData({
      newCategory: e.detail.value
    })
  },

  addCategory() {
    const { newCategory, categories } = this.data
    
    if (!newCategory.trim()) {
      wx.showToast({
        title: '请输入分类名称',
        icon: 'none'
      })
      return
    }
    
    // 检查重复
    if (categories.some(c => c.name === newCategory.trim())) {
      wx.showToast({
        title: '分类名称已存在',
        icon: 'none'
      })
      return
    }
    
    const newCategories = [...categories, {
      id: Date.now().toString(),
      name: newCategory.trim(),
      count: 0
    }]
    
    wx.setStorageSync('categories', newCategories)
    this.setData({
      categories: newCategories,
      newCategory: ''
    })
    
    wx.showToast({
      title: '添加成功'
    })
  },

  editCategory(e) {
    const { id } = e.currentTarget.dataset
    const category = this.data.categories.find(c => c.id === id)
    
    wx.showModal({
      title: '编辑分类',
      content: '',
      editable: true,
      placeholderText: '请输入新的分类名称',
      value: category.name,
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          const newCategories = this.data.categories.map(c => 
            c.id === id ? { ...c, name: res.content.trim() } : c
          )
          wx.setStorageSync('categories', newCategories)
          this.loadCategories()
        }
      }
    })
  },

  deleteCategory(e) {
    const { id } = e.currentTarget.dataset
    const category = this.data.categories.find(c => c.id === id)
    
    if (category.count > 0) {
      wx.showModal({
        title: '提示',
        content: `该分类下还有${category.count}条笔记，确定要删除吗？`,
        success: (res) => {
          if (res.confirm) {
            this.confirmDeleteCategory(id)
          }
        }
      })
    } else {
      this.confirmDeleteCategory(id)
    }
  },

  confirmDeleteCategory(id) {
    // 更新分类列表
    const newCategories = this.data.categories.filter(c => c.id !== id)
    wx.setStorageSync('categories', newCategories)
    
    // 更新笔记的分类
    const notes = wx.getStorageSync('notes') || []
    const newNotes = notes.map(note => 
      note.category === id ? { ...note, category: '' } : note
    )
    wx.setStorageSync('notes', newNotes)
    
    this.loadCategories()
    
    wx.showToast({
      title: '删除成功'
    })
  }
}) 