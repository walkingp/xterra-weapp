// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const cateTable = db.collection("race-cates");
const userTable = db.collection("start-list");

async function updateBibNumber(cateId, id) {

}

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
    users.data.forEach(async (user, index)=>{
      const { _id, gender, trueName } = user;
      const isMale = gender === '男';

      const bibNum = isMale ? bibRule.male.startChar + (bibRule.male.firstBib + index + 1) : bibRule.female.startChar + (bibRule.female.firstBib + index + 1);
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