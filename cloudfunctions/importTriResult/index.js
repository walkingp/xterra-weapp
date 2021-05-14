const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
var xlsx = require('node-xlsx');
const db = cloud.database()
const _ = db.command;
let succCount = 0;
let failedCount = 0;

const startListTable = db.collection("start-list");
const resultTable = db.collection("tri_result");
const raceTable = db.collection("race");

async function insertSingle(raceId, cateTitle, row, mode){
  if(row.length<2){
    return;
  }
  const overallRank = row[0]; //登场排名
  const bibNum = row[1]; //姓名
  const trueName = row[2]; //性别
  const birthDate = row[3];
  const age = row[4];
  const gender = row[5];
  const nation = row[6]; //
  const totalTime = row[7];
  const swimTime = row[8];
  const bikeTime = row[9];
  const runTime = row[10];
  const t1 = row[11];
  const t2 = row[12];
  const division = row[13];
  const divRank = row[14];
  const email = row[15];
  const phone = row[16];
  const city = row[17];
  const province = row[18];
  const zipCode = row[19];
  const addr = row[20];
  const existed = await resultTable.where({ raceId, bibNum }).get();
  if(existed.data.length > 0){
    if(mode === 'replace'){ //覆盖
      await resultTable.where({ raceId, cardNo }).remove();
    }else if(mode === 'ignore'){
      return;
    }
  }

  const race = await raceTable.doc(raceId).get();
  const res = await startListTable.where({ raceId, bibNum }).get();

  if(res.data.length){
    const { cateId, cateTitle, userId, phoneNum, cardType, cardNo } = res.data[0];
    const millionForrestNo = await generateMillionForrestNumber();

    const data = {
      raceId,
      cateId, cateTitle, phoneNum, cardType, cardNo, userId, trueName,
      millionForrestNo,
      status: 'done',
      overallRank,
      bibNum,
      trueName,
      birthDate,
      age,
      gender,
      email,
      nation,
      totalTime,
      swimTime,
      bikeTime,
      runTime,
      t1,
      t2,
      division,
      divRank,
      phone,
      city,
      province,
      zipCode,
      addr
    };
  
    try{
      let result = await resultTable.add({
        data
      });
      console.log('tri-result', result);
      ++ succCount;
    }catch(err){
      console.error(err)
      ++ failedCount;
    }
  }
}

async function generateMillionForrestNumber(){
  const res = await resultTable.where({
    millionForrestNo: _.not(_.eq(null))
  }).count();
  const count = res.total + 1;
  const millionForrestNo = new Date().getFullYear() + count.toString().padStart(5,'0');
  return millionForrestNo;
}

exports.main = async (event, context) => {
  const {
    raceId, fileID, mode
  } = event
  //1,通过fileID下载云存储里的excel文件
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent

  const tasks = [] //用来存储所有的添加数据操作
  //2,解析excel文件里的数据
  var sheets = xlsx.parse(buffer); //获取到所有sheets
  sheets.forEach(function (sheet) {
    console.log(sheet['name']);
    const cateTitle = sheet['name'];
    for (var rowId in sheet['data']) {
      var row = sheet['data'][rowId]; //第几行数据
      if (rowId > 0 && row) { //第一行是表格标题，所有我们要从第2行开始读
        //3，把解析到的数据存到excelList数据表里
        const promise = insertSingle(raceId, cateTitle, row, mode);
        tasks.push(promise)
      }
    }
  });

  // 等待所有数据添加完成
  let result = await Promise.all(tasks).then(res => {
    return res
  }).catch(function (err) {
    return err
  })
  return { result, succCount, failedCount };
}