// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

function generateCode(len){
  const seeds = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = len; i > 0; --i) result += seeds[Math.floor(Math.random() * seeds.length)];
  return result;
}

const db = cloud.database()
const couponTable = db.collection("coupon")
// 云函数入口函数
exports.main = async (event, context) => {
  const { title, value, num, type, expiredDate, raceId, cateId, raceTitle, cateTitle, isOff } = event;
  const wxContext = cloud.getWXContext();

  let coupon = null;
  for(let i=0; i < num; i++){
    coupon = generateCode(12);
    couponTable.add({
      data: {
        _createTime: new Date(),
        _updateTime: new Date(),
        assignedTrueName: null,
        assignedUserId: null,
        coupon,
        expiredDate,
        isActive: true,
        isUsed: false,
        source: 'admin',
        title,
        value,
        type,
        raceId,
        cateId,
        raceTitle, 
        cateTitle,
        isOff
      }
    })
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}