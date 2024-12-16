const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { notes, categories } = event
  
  try {
    // 加密数据
    const encryptedNotes = notes.map(note => ({
      ...note,
      content: encrypt(note.content) // 加密笔记内容
    }))
    
    // 更新或创建备份
    await db.collection('backups').where({
      _openid: OPENID
    }).update({
      data: {
        notes: encryptedNotes,
        categories,
        updateTime: Date.now()
      }
    }).then(res => {
      if (!res.stats.updated) {
        return db.collection('backups').add({
          data: {
            _openid: OPENID,
            notes: encryptedNotes,
            categories,
            updateTime: Date.now()
          }
        })
      }
    })
    
    return {
      success: true
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
}

// 简单的加密函数
function encrypt(text) {
  const key = 'your-secret-key'
  let result = ''
  for(let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return Buffer.from(result).toString('base64')
} 