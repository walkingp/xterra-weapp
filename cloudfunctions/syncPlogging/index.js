// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const $ = _.aggregate
  const userTable = db.collection('start-list');
  const res = await userTable.aggregate()
  .match({
    raceType: 'X-Plogging'
  })
  .group({
    _id: {
      cardNo: '$cardNo',
      raceType: 'X-Plogging',
      trueName: '$trueName'
    },
    num: $.sum(1)
  })
  .limit(1000)
  .end();
  res.list.forEach(async item=>{
    const { cardNo } = item._id;
    await userTable.where({ cardNo, raceType: 'X-Plogging' }).update({
      data: {
        plogging: item.num > 1 ? '是' : '否'
      }
    })
  });
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}