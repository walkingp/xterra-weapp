// 云函数入口文件
const cloud = require('wx-server-sdk')
const md5 = require('md5-node')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

function setTimeDateFmt(s) {  // 个位数补齐十位数
  return s < 10 ? '0' + s : s;
}

function randomNumber() {
  const now = new Date()
  let month = now.getMonth() + 1
  let day = now.getDate()
  let hour = now.getHours()
  let minutes = now.getMinutes()
  let seconds = now.getSeconds()
  month = setTimeDateFmt(month)
  day = setTimeDateFmt(day)
  hour = setTimeDateFmt(hour)
  minutes = setTimeDateFmt(minutes)
  seconds = setTimeDateFmt(seconds)
  let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000)).toString();
  console.log(orderCode)
  return orderCode;
}

const db = cloud.database()
const regTable = db.collection("registration")
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const orderNum = randomNumber();
  //添加当前用户信息
  let id = null;
  try {
    id = await regTable.add({
      data: {
        ...event.data,
        ...wxContext,
        orderNum,
        _openid: wxContext.OPENID,
        addedDate: new Date()
      }
    })
  } catch (e) {
    console.error(e)
  }
  return {
    id,
    orderNum,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}