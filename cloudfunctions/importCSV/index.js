const cloud = require('wx-server-sdk')
cloud.init()
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

const startListTable = db.collection("start-list");
const cateTable = db.collection("race-cates");
async function insertSingle(raceId, row){
  if(row.length<2){
    return;
  }
  const cateTitle = row[0]; //组别
  const trueName = row[1]; //姓名
  const gender = row[2]; //性别
  const cardType = row[3]; //证件类型
  const cardNo = row[4];
  const birthDate = row[5];
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
    const { type, cateTitle, raceTitle, raceId } = cate;
    const groupText = cates[type].groupText;
    const existed = await startListTable.where({ cateId, cardNo }).get();
    debugger
    if(existed.data.length === 0){
      await startListTable.add({
        addr, birthDate, bloodType, cardNo, cardType, cateId, cateTitle, club, contactUser, contactUserPhone,
        createdAt: new Date(),
        email, gender, groupText, groupType: type, isAgeValid: true, isCertApproved: true, isValid: true,
        nation, orderNum: '',
        orderType: '团报',
        phoneNum, pinyinFirst, pinyinLast,
        raceId, raceTitle, 
        region: province + city + country,
        status: 1, statusText: '已支付',
        tSize, trueName,
        postCode,
        age
      })
    }
  }
}

exports.main = async (event, context) => {
  const {
    raceId, fileID
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
      console.log(rowId);
      var row = sheet['data'][rowId]; //第几行数据
      if (rowId > 1 && row) { //第一行是表格标题，所有我们要从第2行开始读
        //3，把解析到的数据存到excelList数据表里
        const promise = insertSingle(raceId, row);
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
  return result
}