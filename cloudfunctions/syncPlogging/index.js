// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { cardNos } = event;
  let matched = { raceType: 'X-Plogging' };
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command
  const $ = _.aggregate
  if(cardNos){
    matched.cardNo = _.in(cardNos);
  }
  const userTable = db.collection('start-list');
  const res = await userTable.aggregate()
  .match(matched)
  .sort({
    createdAt: -1
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