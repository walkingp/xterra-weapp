// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database();
const _ = db.command;
const startListTable = db.collection("start-list");
const resultTable = db.collection("race-result");

async function inserResult(user, city, index) {
  const { raceType, cateId, cardType, cardNo,  gender, phoneNum, raceDate, raceId, trueName } = user;
  if(raceType !== 'X-Plogging'){
    return;
  }
  const millionForrestNo = await generateMillionForrestNumber(index);
  const data = { millionForrestNo, city, cateId, cardType, cardNo, gender, phoneNum, raceDate, raceId, status: 'done', isCertApproved: true, trueName };
  const existed = await resultTable.where({ cateId, cardNo }).get();
  if(existed.data.length === 0){
    await resultTable.add({
      data
    });
  }
}

async function generateMillionForrestNumber(index){
  const res = await resultTable.where({
    millionForrestNo: _.not(_.eq(null))
  }).count();
  const count = res.total + index + 1;
  const millionForrestNo = new Date().getFullYear() + count.toString().padStart(5,'0');
  return millionForrestNo;
}

async function removeResult({cateId, cardNo}){
  const existed = await resultTable.where({ cateId, cardNo }).get();
  if(existed.data.length > 0){
    await resultTable.where({ cateId, cardNo }).remove();
  }
}

// X-Plogging生成成绩
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, cateId, cardNo, finishedStatus = 'done', city } = event;
  let result = null;
  switch(action){
    case 'batch':
      const r1 = await startListTable.where({ cateId }).get();
      const users = r1.data;
      // 增加成绩记录
      users.forEach(async (user, index) => {
        inserResult(user, city, index);
      });
      result = startListTable.where({
        cateId
      }).update({
        data: { finishedStatus }
      })
      break;
    case 'single':
      const r2 = await startListTable.where({ cateId, cardNo }).get();
      const user = r2.data[0];
      
      if(finishedStatus === 'done'){
        inserResult(user, city, 0);
      }else if(finishedStatus === 'DNS'){
        removeResult(user);
      }
      result = startListTable.where({
        cateId, cardNo
      }).update({
        data: { finishedStatus }
      })
      break;
  }
  return result;
}