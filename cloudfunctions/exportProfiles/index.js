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
  const db = cloud.database()
  const _ = db.command;
  const profileTable = db.collection("profile");

  let pageSize = 200;
  
  let allProfiles = [];
  const pTotal = await profileTable.count();
  const pPages = Math.ceil(pTotal.total / pageSize);  
  for (let i = 1; i <= pPages; i++) {
    const user = await profileTable.skip((i - 1) * pageSize).limit(pageSize).get();
    allProfiles.push(user.data);
  }


  let res2 = [];
  allProfiles.forEach(item => res2 = res2.concat(...item));
  let cols2 = ['真实姓名', '性别', '手机号', 'Email', '国籍', '地区', '地址', '证件类型','证件号','出生日期','俱乐部','服装尺码','紧急联系人','紧急联系人手机'];

  let users2 = [cols2];
  res2.forEach(item => {
    let user = [];
    user.push(item.trueName);
    user.push(item.gender);
    user.push(item.phoneNum);
    user.push(item.nation);
    user.push(item.region);
    user.push(item.addr);
    user.push(item.cardType);
    user.push(item.cardNo);
    user.push(dayjs(item.birthDate).format("YYYY-MM-DD"));
    user.push(item.club);
    user.push(item.tSize);
    user.push(item.contactUser);
    user.push(item.contactUserPhone);
    users2.push(user);
  })

  console.log(`共有录入资料人数${users2.length-1}`);

  const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
  const fileName = `XTERRA小程序-${dateStr}注册用户表.xlsx`;
  try {
    const buffer = await xlsx.build([{
      name: '所有录入报名资料',
      data: users2
    }])
    console.log(`开始上传文件${fileName}`);
    const file = await cloud.uploadFile({
      cloudPath: 'reports/user/' + fileName,
      fileContent: buffer, //excel二进制文件
    })

    return await cloud.getTempFileURL({
      fileList: [file.fileID]
    });
  } catch (err) {
    console.error(err)
  }
}