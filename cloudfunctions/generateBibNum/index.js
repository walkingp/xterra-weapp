// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const cateTable = db.collection("race-cates");
const userTable = db.collection("start-list");

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { raceId } = event;
  const cates = await cateTable.where({ raceId }).get();
  let count = 0;
  cates.data.forEach(async cate=>{
    const { bibRule, _id } = cate;
    if(!bibRule){
      return;
    }
    const users = await userTable.where({ cateId: _id }).limit(1000).get();
    let maleCount = 0, femalCount = 0;
    users.data.forEach(async (user)=>{
      const { _id, gender, trueName } = user;
      const isMale = gender === '男';
      let bibNum = '';
      if(isMale){
        maleCount += 1;
        bibNum = bibRule.male.startChar + (bibRule.male.firstBib + maleCount)
      }else{
        femalCount += 1;
        bibNum = bibRule.female.startChar + (bibRule.female.firstBib + femalCount);
      }

      await userTable.doc(_id).update({
        data: {
          bibNum
        }
      });
      count += 1;
      console.log(trueName + ': ' + bibNum);
    })
    console.log(`${count}人已更新号码`)
  })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}