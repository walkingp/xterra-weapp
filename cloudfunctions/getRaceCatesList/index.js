// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();

async function getCateUserCount(cateId) {
  return await db.collection("start-list").where({
    cateId
  }).count();
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { raceId } = event;
  const res = await db.collection('race-cates')
  .where({
    raceId,
    isActive: true
  }).orderBy(
    "order", 'desc'
  ).get();

  const result = await Promise.all(res.data.map(async item=> {
    const count = await getCateUserCount(item._id);
    item.users = Array(count.total);
    return item;
  }));

  return { list: result };
}