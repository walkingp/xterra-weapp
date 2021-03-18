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
    isUsed = false
  } = event;

  const db = cloud.database();
  const couponTable = db.collection("coupon");
  const total = await couponTable.where({
    isUsed
  }).count();

  let pageSize = 500;
  const pageCount = Math.ceil(total.total / pageSize);
  let allUsers = [];
  for (let i = 1; i <= pageCount; i++) {
    const user = await couponTable.where({
      isUsed
    }).skip((i - 1) * pageSize).limit(pageSize).get();
    allUsers.push(user.data);
  }

  console.log(`开始读取优惠券`);

  let res = []
  allUsers.forEach(item => res = res.concat(...item));
  let coupons = [
    ['优惠券名称', '优惠券代码', '类型', '金额', '是否已使用', '指派', '可用比赛', '可用组别', '过期时间']
  ];
  res.forEach(item => {
    let coupon = [];
    coupon.push(item.title);
    coupon.push(item.coupon);
    coupon.push(item.type === 'free' ? '全额抵扣券' : '减免券');
    coupon.push(item.value);
    coupon.push(item.isUsed ? '已使用' : '未使用');
    coupon.push(item.assignedUserName);
    coupon.push(item.raceTitle);
    coupon.push(item.cateTitle);
    coupon.push(dayjs(item.expiredDate).format("YYYY-MM-DD"));
    coupons.push(coupon);
  })

  console.log(`共有优惠券${coupons.length-1}张`);

  const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
  const fileName = `${dateStr}${isUsed ? '已使用' : '未使用'}优惠券.xlsx`;
  const sheetName = '优惠券';
  try {
    const buffer = await xlsx.build([{
      name: sheetName,
      data: coupons
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