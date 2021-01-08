import { getPaginations, getCollectionById } from "../utils/cloud";
const dayjs = require("dayjs");

export const getCouponList = async ( pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'coupon',
    orderBy: {
      _createTime: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getCouponDetail = async id => {
  const data = await getCollectionById({ dbName: 'coupon', id });
  return data;
}

export const exportCouponList = async (isUsed = false) => {
  const db = wx.cloud.database()
  const couponTable = db.collection("coupon");
  return new Promise(async (resolve, reject) => {
    console.log(`开始读取优惠券`);
    const res = await couponTable.where({ isUsed }).limit(1000).get();
    let coupons = [['优惠券名称', '优惠券代码','类型','金额', '是否已使用', '指派','可用比赛','可用组别','过期时间']];
    res.data.forEach(item => {
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
  
    console.log(`共有报名人数${coupons.length}`);
  
    const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
    const fileName =  `${dateStr}${isUsed ? '已使用' : '未使用'}优惠券.xlsx`;
    const sheetName = '优惠券';
    try{
      wx.cloud.callFunction({
        name: 'exportCSV',
        data: {
          data: coupons,
          fileName,
          sheetName
        },
        success(res) {
          resolve(res.result)
        }
      });
    }catch(err){
      reject(err)
    }
  })
}