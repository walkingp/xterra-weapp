// 云函数入口文件
const cloud = require('wx-server-sdk')
const dayjs = require("dayjs");
const xlsx = require('node-xlsx');

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event) => {
  const {
    raceId
  } = event;

  const db = cloud.database()
  const raceTable = db.collection("race");
  const userTable = db.collection("start-list");
  const total = await userTable.where({
    raceId
  }).count();

  let pageSize = 200;
  const pageCount = Math.ceil(total.total / pageSize);
  let allUsers = [];
  for (let i = 1; i <= pageCount; i++) {
    const user = await userTable.where({
      raceId
    }).skip((i - 1) * pageSize).limit(pageSize).get();
    allUsers.push(user.data);
  }

  const race = await raceTable.doc(raceId).get();
  const {
    title
  } = race.data;
  console.log(`开始读取${title}报名人数`);

  let res = []
  allUsers.forEach(item => res = res.concat(...item));
  let cols = ['组别', '审核通过', '姓名', '拼音名', '拼音姓', '号码', '性别', '手机号', '微信号', '国籍', '证件类型', '证件号码', '出生日期', '邮箱', '所属俱乐部', '血型', '衣服尺码', '省份', '住址', '紧急联系人', '紧急联系人手机'];
  const isPlogging = race.type === 'X-Plogging';
  if (isPlogging) {
    cols.push('是否参加过X-Plogging');
  }
  let users = [cols];
  res.forEach(item => {
    let user = [];
    user.push(item.cateTitle);
    user.push(item.isCertApproved ? '是' : '否');
    user.push(item.trueName);
    user.push(item.pinyinFirst);
    user.push(item.pinyinLast);
    user.push(item.bibNum ? item.bibNum: '');
    user.push(item.gender);
    user.push(item.phoneNum);
    user.push(item.wechatid);
    user.push(item.nation);
    user.push(item.cardType);
    user.push(item.cardNo);
    user.push(dayjs(item.birthDate).format("YYYY-MM-DD"));
    user.push(item.email);
    user.push(item.club);
    user.push(item.bloodType);
    user.push(item.tSize);
    user.push(item.region);
    user.push(item.addr);
    user.push(item.contactUser);
    user.push(item.contactUserPhone);
    if (isPlogging) {
      user.push(item.plogging);
    }
    users.push(user);
  })

  console.log(`共有报名人数${users.length-1}`);

  const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
  const fileName = `${title}-${dateStr}完整报名表.xlsx`;
  const sheetName = '完整报名表';
  try {
    const buffer = await xlsx.build([{
      name: sheetName,
      data: users
    }])
    console.log(`开始上传文件${fileName}`);
    const file = await cloud.uploadFile({
      cloudPath: 'reports/' + fileName,
      fileContent: buffer, //excel二进制文件
    })

    return await cloud.getTempFileURL({
      fileList: [file.fileID]
    });
  } catch (err) {
    console.error(err)
  }
}