// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()  
  const { cateId } = event;
  const res = await db.collection('race-cates')
  .aggregate()
  .match({
    _id: cateId
  })  
  .project({
    isActive: true,
    title: true,
    'form-fields': true,
    isCheckCert: true,
    certTitle: true,
  })
  .lookup({
    from: 'form-fields',
    localField: 'form-fields',
    foreignField: '_id',
    as: 'fields',
  })
  .sort({
    order: -1
  })
  .limit(100)
  .end()

  return res;
}