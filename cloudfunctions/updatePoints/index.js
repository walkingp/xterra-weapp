// 云函数入口文件
const cloud = require('wx-server-sdk')
const {
  rules,
  pointRuleEnum
} = require("./config");

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const usersTable = db.collection("userlist")
const pointsTable = db.collection("points")
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let {
    type,
    userId,
    extraData
  } = event;
  let rule = rules.find(rule => rule.id === type);
  let {
    title,
    point
  } = rule;
  if(rule.id === pointRuleEnum.AdminCustom){
    point = extraData.point;
    rule.point = extraData.point;
    rule.title = extraData.title;
  }
  try {
    let existed = null;
    if (rule.once) {
      existed = await pointsTable.where({
        userId,
        rule
      }).get();
    } else {
      existed = await pointsTable.where({
        userId,
        rule,
        'extraData.id': extraData.id
      }).get();
    }
    if (existed.data.length === 0) {
      await pointsTable.add({
        data: {
          extraData,
          updatedAt: new Date(),
          createdAt: new Date(),
          userId,
          point,
          rule
        }
      });
      console.log(userId);
      const res = await usersTable.doc(userId).get();
      const user = res.data;
      let newPoint = user.point ? user.point : 0;
      newPoint = newPoint + point;
      await usersTable.doc(userId).update({
        data: {
          point: newPoint
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}