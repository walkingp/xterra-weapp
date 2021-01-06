// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
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
  }else if(action === 'batch') {
    const all = await cateTable.get();
    all.data.forEach(async cate => {
      let users = [];
      const cid = cate._id;
      const result = await startListTable.where({ cateId: cid }).limit(1000).get();
      users = result.data.map(item => {
        const { userId, userName, trueName, gender, userInfo } = item;
        return {
          userId, userName, trueName, gender, userInfo
        }
      });
      await cateTable.doc(cid).update({
        data: {
          users
        }
      })
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
  await cateTable.doc(cateId).update({
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