// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')
const md5 = require('md5-node')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const usersTable = db.collection("users")
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const wxContext = cloud.getWXContext()
  //更新当前信息
  if (event.update == true) {
    try {
      return await usersTable.doc(md5(wxContext.OPENID)).update({
        data: {
          userData: _.set(event.userData)
        },
      })
    } catch (e) {
      console.error(e)
    }
  } else if (event.getSelf == true) {
    //获取当前用户信息
    try {
      return await usersTable.doc(md5(wxContext.OPENID)).field({
        _openid: false
      }).get()
    } catch (e) {
      console.error(e)
    }
  } else if (event.setSelf == true) {
    //添加当前用户信息
    try {
      return await usersTable.add({
        data: {
          _id: md5(wxContext.OPENID),
          _openid: wxContext.OPENID,
          nickname: event.userData.nickName,
          avatarUrl: event.userData.avatarUrl,
          gender: event.userData.gender,
          addedDate: new Date()
        }
      })
    } catch (e) {
      console.error(e)
    }
  } else if (event.getOthers == true) {
    //获取指定用户信息
    try {
      return await usersTable.doc(event.userId).field({
        userData: true
      }).get()
    } catch (e) {
      console.error(e)
    }
  }
}