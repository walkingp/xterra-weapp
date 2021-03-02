const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
var xlsx = require('node-xlsx');
const db = cloud.database()

const cates = {
  individual: {
    groupType: 'individual',
    groupText: '个人组'
  },
  relay: {
    groupType: 'relay',
    groupText: '接力组'
  },
  family: {
    groupType: 'family',
    groupText: '家庭组'
  }
};

let succCount = 0;
let failedCount = 0;

function setTimeDateFmt(s) {  // 个位数补齐十位数
  return s < 10 ? '0' + s : s;
}
function orderNumber() {
  const now = new Date()
  let month = now.getMonth() + 1
  let day = now.getDate()
  let hour = now.getHours()
  let minutes = now.getMinutes()
  let seconds = now.getSeconds()
  month = setTimeDateFmt(month)
  day = setTimeDateFmt(day)
  hour = setTimeDateFmt(hour)
  minutes = setTimeDateFmt(minutes)
  seconds = setTimeDateFmt(seconds)
  let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000)).toString();
  console.log(orderCode)
  return orderCode;
}

function formatDate(num){
  return new Date(num);
}

const startListTable = db.collection("start-list");
const cateTable = db.collection("race-cates");
const raceTable = db.collection("race");
const regTable = db.collection("registration");

async function insertSingle(raceId, row, mode){
  if(row.length<2){
    return;
  }
  const cateTitle = row[0]; //组别
  const trueName = row[1]; //姓名
  const gender = row[2]; //性别
  const cardType = row[3]; //证件类型
  const cardNo = row[4];
  const birthDate = formatDate(row[5]);
  const age = row[6];
  const email = row[7];
  const phoneNum = row[8];
  const nation = row[9];
  const province = row[10];
  const city = row[11];
  const country = row[12];
  const addr = row[13];
  const postCode = row[14];
  const contactUser = row[15];
  const contactUserPhone = row[16];
  const bloodType = row[17];
  const tSize = row[18];
  const club = row[19];
  const pinyinLast = row[20];
  const pinyinFirst = row[21]
  const res = await cateTable.where({ raceId, title: cateTitle }).get();
  if(res.data.length > 0){    
    const cate = res.data[0];
    const cateId = cate._id;
    const { type, raceId } = cate;
    const race = await raceTable.doc(raceId).get();
    const raceTitle = race.data.title;
    const racePic = race.data.picUrls;

    const groupText = cates[type].groupText;
    const existed = await startListTable.where({ cateId, cardNo }).get();
    if(existed.data.length > 0){
      if(mode === 'replace'){ //覆盖
        await startListTable.where({ cateId, cardNo }).remove();
      }else if(mode === 'ignore'){
        return;
      }
    }
    const orderNum = orderNumber();
    const data = {
      addr, birthDate, bloodType, cardNo, cardType, cateId, cateTitle, club, contactUser, contactUserPhone,
      createdAt: new Date(),
      racePic,
      email, gender, groupText, groupType: type, isAgeValid: true, isCertApproved: true, isValid: true,
      nation, orderNum,
      orderType: '线下团报',
      phoneNum, pinyinFirst, pinyinLast,
      raceId, raceTitle, 
      region: province + city + country || '',
      status: 1, statusText: '已支付',
      tSize, trueName,
      postCode,
      age
    };

    let result = await startListTable.add({
      data
    });
    console.log('start-list', result);
    result = await insertRegistration(data);
    console.log('registration', result);
    ++ succCount;
  }
  ++ failedCount;
}

async function insertRegistration(param){
  // out_trade_no, paidFee, price, totalFee, userId, userInfo, userName
  const { racePic, addr, birthDate, bloodType, cardNo, cardType, contactUser, contactUserPhone, email, gender, phoneNum, region, tSize, trueName, cateId, cateTitle, groupType, groupText, orderNum, orderType, raceTitle, status, statusText } = param;
  const existed = await regTable.where({ orderNum }).get();
  if(existed.data.length === 0){
    const profiles = [{ racePic, addr, birthDate, bloodType, cardNo, cardType, contactUser, contactUserPhone, email, gender, phoneNum, region, tSize, trueName }];
    const data = {
      addedDate: new Date(),
      profileCount: 1,
      profiles,
      racePic,
      cateId, cateTitle, groupType, groupText, orderNum, orderType, raceTitle, status, statusText
    };
    await regTable.add({
      data
    })
  }
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
    for (var rowId in sheet['data']) {
      var row = sheet['data'][rowId]; //第几行数据
      if (rowId > 1 && row) { //第一行是表格标题，所有我们要从第2行开始读
        //3，把解析到的数据存到excelList数据表里
        const promise = insertSingle(raceId, row, mode);
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