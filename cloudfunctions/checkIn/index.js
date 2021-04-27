// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const checkInTable = db.collection("checkin")
const userTable = db.collection("start-list")
// 云函数入口函数
exports.main = async (event, context) => {
  const { userId, cardNo, trueName, bibNum, checkinUserId, checkinTrueName, raceId, raceTitle, cateId, cateTitle, cardPic } = event;
  const existed = await checkInTable.where({ cateId, userId }).get();
  if(existed.data.length === 0){
   const res = await checkInTable.add({
      data: {
        userId, cardNo, trueName,bibNum, checkinUserId, checkinTrueName, raceId, raceTitle, cateId, cateTitle, cardPic,
        checkinTime: new Date()
      }
    });
    await userTable.where({ cateId, userId }).update({
      data: {
        finishedStatus: 'checkedIn'
      }
    });
    return { data: res, code: 0};
  }

  return {
    msg: '已经检录过',
    code: -1
  }
}