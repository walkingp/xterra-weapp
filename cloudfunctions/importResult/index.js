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
const resultTable = db.collection("race-result");
const raceTable = db.collection("race");

async function insertSingle(raceId, cateTitle, row, mode){
  if(row.length<2){
    return;
  }
  const bib = row[0]; //号码
  const trueName = row[1]; //姓名
  const gender = row[2]; //性别
  const group = row[3]; //组别
  const roughTime = row[4];
  const netTime = row[5];
  const genderRank = row[6];
  const overallRank = row[7];
  const cp1=row[8];
  const cp2=row[9];
  const cp3=row[10];
  const cp4=row[11];
  const cp5=row[12];
  const cp6=row[13];
  const cp7=row[14];
  let checkPoints = [];
  if(cp1){
    checkPoints.push({ title: 'CP1', time: cp1 })
  }
  if(cp2){
    checkPoints.push({ title: 'CP2', time: cp2 })
  }
  if(cp3){
    checkPoints.push({ title: 'CP3', time: cp3 })
  }
  if(cp4){
    checkPoints.push({ title: 'CP4', time: cp4 })
  }
  if(cp5){
    checkPoints.push({ title: 'CP5', time: cp5 })
  }
  if(cp6){
    checkPoints.push({ title: 'CP6', time: cp6 })
  }
  if(cp7){
    checkPoints.push({ title: 'CP7', time: cp7 })
  }
  const existed = await resultTable.where({ raceId, bib }).get();
  if(existed.data.length > 0){
    if(mode === 'replace'){ //覆盖
      await resultTable.where({ raceId, cardNo }).remove();
    }else if(mode === 'ignore'){
      return;
    }
  }

  const race = await raceTable.doc(raceId).get();
  const { city, raceDate } = race.data;
  const res = await startListTable.where({ raceId, bibNum: bib }).get();

  if(res.data.length){
    const { cateId, cateTitle, phoneNum, cardType, cardNo } = res.data[0];
    const millionForrestNo = await generateMillionForrestNumber();

    const data = {
      _createTime: new Date(),
      trueName,
      status: 'done',
      gender,
      bib,
      raceId,
      city,
      raceDate,
      cateId,
      cateTitle,
      roughTime,
      netTime,
      phoneNum,
      cardType,
      cardNo,
      genderRank,
      overallRank,
      checkPoints,
      millionForrestNo
    };
  
    try{
      let result = await resultTable.add({
        data
      });
      console.log('race-result', result);
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