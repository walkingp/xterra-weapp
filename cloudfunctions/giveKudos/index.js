// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const kudosTable = db.collection("kudos")
const feedTable = db.collection("feed")
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    type,
    id,
    data
  } = event;
  const res = await feedTable.doc(id).get();
  if (res.data) {
    const feed = res.data;
    const kudos_list = feed.kudos_list || [];
    let hasMe = false;
    if(kudos_list.length){
      hasMe = kudos_list.some(item => {
        return item.userId === data.userId;
      });
    }
    if (hasMe) {
      await kudosTable.where({
        type,
        id
      }).remove();
      const index = kudos_list.findIndex(item => {
        return item.userId === data.userId;
      });
      kudos_list.splice(index, 1);
      const re = await feedTable.doc(id).update({
        data: {
          kudos_list,
          kudos: _.inc(-1)
        }
      })
      console.log(re)
    } else {
      await kudosTable.add({
        data: {
          type,
          id,
          ...data
        }
      });
      kudos_list.push({userInfo: data.userInfo, userId: data.userId},);
      const re = await feedTable.doc(id).update({
        data: {
          kudos_list,
          kudos: _.inc(1)
        }
      })
      console.log(re);
    }
  }
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}