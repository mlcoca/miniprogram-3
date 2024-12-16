const formatTime = date => {
  const now = new Date()
  const diff = now - date
  
  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `今天 ${[hour, minute].map(formatNumber).join(':')}`
  }
  
  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }
  
  // 如果是今年
  if (date.getFullYear() === now.getFullYear()) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${[month, day].map(formatNumber).join('-')}`
  }
  
  // 其他情况显示完整日期
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  formatNumber
}
