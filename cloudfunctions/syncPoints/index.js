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
  const pointTable = db.collection("points");
  const res = await userTable.aggregate()
  .limit(1000)
  .end();
  res.list.forEach(async (item, index)=>{
    if(index > 0) return;
    const { userId, _id } = item;
    cloud.callFunction({
      name: 'updatePoints',
      data: {
        userId,
        type: 2,
        extraData: {
          id: _id,
          title: "报名赛事活动"
        }
      },
      success: res => {
        resolve(res.result)
      },
      fail: err=> {
        reject(err)
      }
    });
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}