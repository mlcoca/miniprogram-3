const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const backup = await db.collection('backups')
      .where({
        _openid: OPENID
      })
      .get()
    
    if (!backup.data.length) {
      throw new Error('未找到备份数据')
    }
    
    const { notes, categories } = backup.data[0]
    
    // 解密数据
    const decryptedNotes = notes.map(note => ({
      ...note,
      content: decrypt(note.content) // 解密笔记内容
    }))
    
    return {
      success: true,
      data: {
        notes: decryptedNotes,
        categories
      }
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
}

// 解密函数
function decrypt(encryptedText) {
  const key = 'your-secret-key'
  const text = Buffer.from(encryptedText, 'base64').toString()
  let result = ''
  for(let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
} 