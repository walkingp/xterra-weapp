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
  const regTable = db.collection("registration");
  const total = await regTable.where({
    raceId
  }).count();

  let pageSize = 200;
  const pageCount = Math.ceil(total.total / pageSize);
  let allUsers = [];
  for (let i = 1; i <= pageCount; i++) {
    const user = await regTable.where({
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
  res.map(item => {
    item.addedDate = dayjs(item.addedDate).format("YYYY-MM-DD HH:mm:ss");
    item.profiles = item.profiles && item.profiles.length ? item.profiles.map(p => p.trueName).join() : '';
  });
  let orders = [
    ['订单编号', '订单提交人', '类别', '赛事', '组别', '报名人数', '报名人', '订单状态', '订单金额', '优惠金额', '实付金额', '退款金额', '支付方式', '下单时间']
  ];
  res.forEach(item => {
    let user = [];
    user.push(item.orderNum);
    user.push(item.userName);
    user.push(item.groupText);
    user.push(item.raceTitle);
    user.push(item.cateTitle);
    user.push(item.profileCount);
    user.push(item.profiles);
    user.push(item.statusText);
    user.push(item.totalFee);
    user.push(item.discountFee);
    user.push(item.paidFee);
    user.push(item.refundFee);
    user.push(item.orderType);
    user.push(item.addedDate);
    orders.push(user);
  })

  console.log(`共有订单${orders.length-1}`);

  const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
  const fileName = `${title}-${dateStr}完整订单表.xlsx`;
  const sheetName = '完整订单表';
  try {
    const buffer = await xlsx.build([{
      name: sheetName,
      data: orders
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