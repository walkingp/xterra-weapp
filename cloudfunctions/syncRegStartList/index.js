// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { _raceId, _cateId, _orderNum, _userId } = event;
  let filter = { };
  if(_raceId) filter["raceId"] = _raceId;
  if(_cateId) filter["cateId"] = _cateId;
  if(_orderNum) filter["orderNum"] = _orderNum;
  if(_userId) filter["userId"] = _userId;
  const wxContext = cloud.getWXContext();

  const db = cloud.database();
  const _ = db.command;
  const $ = _.aggregate;

  const res = await db.collection("registration").where(filter).get();  
  const userTable = db.collection("start-list");
  res.data?.forEach(item => {
    const { orderNum, out_trade_no, cateId, cateTitle, groupText, groupType, orderType, profiles, raceDate, raceId, racePic, raceTitle, raceType,status, statusText, totalFee, userId, userInfo, userName } =  item;
    profiles?.forEach(async profile=>{
      const { cardNo, wechatId } = profile;
      const existed = await userTable.where({ cateId, cardNo }).get();
      if(existed.data.length === 0 && status === 1){
        await userTable.add({
          data: {
            ...profile,
            cateId,
            cateTitle,
            orderNum, out_trade_no,
            groupText, groupType, orderType,
            wechatId,
            source: '管理员修正',
            raceDate, raceId, racePic, raceTitle, raceType, status, statusText, totalFee, userId, userInfo, userName
          }
        })
      }
    })

  })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}