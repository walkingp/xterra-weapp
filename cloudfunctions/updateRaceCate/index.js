// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const cateTable = db.collection("race-cates");
const startListTable = db.collection("start-list");
const regTable = db.collection("registration");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, cateId, id  } = event;

  if(action === 'cancel'){
    const p1 = await regTable.doc(id).get();
    const { profiles } = p1.data;
    profiles.forEach(async item=>{
      const { cardNo } = item;
      const p2 = await startListTable.where({ cardNo, cateId }).remove();
      console.log(p2);
    })
  }
  let users = [];
  const result = await startListTable.where({ cateId }).limit(1000).get();
  users = result.data.map(item => {
    const { userId, userName, trueName, gender, userInfo } = item;
    return {
      userId, userName, trueName, gender, userInfo
    }
  });
  const res = await cateTable.doc(cateId).get();
  cateTable.doc(cateId).update({
    data: {
      users
    }
  })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}