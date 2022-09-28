// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command;
const resultTable = db.collection("race-result");

async function generateMillionForrestNumber(){
  const res = await resultTable.where({
    millionForrestNo: _.not(_.eq(null))
  }).count();
  const count = res.total + 1;
  const millionForrestNo = new Date().getFullYear() + count.toString().padStart(5,'0');
  return millionForrestNo;
}
// 云函数入口函数
exports.main = async (event, context) => {
  const { raceId, cateId } = event;
  let filter = { };
  if(raceId){
    filter["raceId"] = raceId;
  }
  if(cateId){
    filter["cateId"] = cateId;
  }
  const raceTable = db.collection("race");
  const _data = await raceTable.doc(raceId).get();
  console.log(_data);
  const { raceDate, city } = _data.data;

  const userTable = db.collection("start-list");
  const res = await userTable.where(filter).get();
  let count = 0;
  res.data?.forEach(async item => {
    const { cardNo, cardType, cateId, gender, phoneNum, trueName } = item;
    const millionForrestNo = await generateMillionForrestNumber(resultTable);
    const d = await resultTable.where({ cardNo, cateId }).get();
    if(d.data.length === 0){
      resultTable.add({
        data: {
          raceDate, city, cardNo, cardType, cateId, gender, phoneNum, trueName, raceId, status: 'done', millionForrestNo, _createTime: new Date()
        }
      });
      count = count + 1;
    }
  })

  return count;
}