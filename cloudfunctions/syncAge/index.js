// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const userTable = db.collection('start-list');
  // age为空或者为0
  const res1 = await userTable.where({
    age: _.exists(false).or(_.eq(0))
  }).limit(1000).get();
  // birthDate为1970-1-1
  let startTime = new Date(1969, 12, 1, 0, 0, 0);
  let endTime = new Date(1970, 1, 1, 23, 59, 59);
  const res2 = await userTable.where({
    birthDate: _.gte(new Date(startTime)).and(_.lte(new Date(endTime)))
  }).limit(1000).get();
    [...res1.data, ...res2.data].forEach(async item => {
      const {
        _id,
        trueName,
        cardNo
      } = item;
      if (cardNo.length >= 18) {
        const birthDateStr = cardNo.substr(6, 8);
        const birthDate = new Date(birthDateStr.substr(0,4), birthDateStr.substr(4,2), birthDateStr.substr(6,2));
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        await userTable.doc(_id).update({
          data: {
            birthDate,
            age
          }
        });
        console.log(trueName + ', 出生日期: ' + new Date(birthDate).getFullYear() + ', 年龄：' + age);
      }else{
        console.log(trueName + '未修改（包含护照）, 出生日期: ' + new Date(birthDate).getFullYear() + ', 年龄：' + age);
      }
    });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}