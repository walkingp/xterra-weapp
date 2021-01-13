import dayjs from "dayjs";
import { emailTemplateType, orderStatus } from "../config/const";
import { sendRegEmail } from "./email";
import { updateCoupon, updateOrderStatus } from "./race";
import { sendRegSMS } from "./sms";

export const payNow = function(detail, callback) {
  const { paidFee } = detail;
  const nonceStr = Math.random().toString(36).substr(2, 15)
  const timeStamp = parseInt(Date.now() / 1000) + ''
  const out_trade_no = "otn" + nonceStr + timeStamp
  const total_fee = (paidFee * 100).toString();

  getApp().globalData.out_trade_no = out_trade_no;

  if(paidFee <= 0){
    updateStatuses(detail, callback);
    return;
  }
  wx.showLoading({
    title: '支付中',
  });

  wx.cloud.callFunction({
    name: "payment",
    data: {
      command: "pay",
      out_trade_no,
      body: detail.raceTitle,
      total_fee
    },
    success(res) {
      console.log("云函数payment提交成功：", res.result)
      pay(res.result, detail, callback)
    },
    fail(res) {
      console.log("云函数payment提交失败：", res)
    }
  })
}
function pay(payData, detail, callback) {
  //官方标准的支付方法
  wx.requestPayment({ //已经得到了5个参数
    timeStamp: payData.timeStamp,
    nonceStr: payData.nonceStr,
    package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
    signType: 'MD5',
    paySign: payData.paySign, //签名

    success(res) {
      console.log("支付成功：", res)
      wx.cloud.callFunction({  //巧妙利用小程序支付成功后的回调，再次调用云函数，通知其支付成功，以便进行订单状态变更
        name: "payment",
        data: {
          command: "payOK",
          out_trade_no: "test0004"
        },
        success: function(){
          updateStatuses(detail, callback);
        }
      })
    },
    fail(res) {
      console.log("支付失败：", res);
      const { paidFee, discountFee } = detail;
      updateOrderStatus({ id: detail.id, ...orderStatus.failed, paidFee, discountFee }).then(res=>{
        console.log(res);
        wx.showToast({
          icon: 'none',
          title: '支付失败',
          success: function(){
            wx.redirectTo({
              url: `/pages/register/status/status?id=${detail.id}`,
            })
          }
        })
      });
    },
   complete(res) {
      console.log("支付完成：", res)
    }
  })
};
function updateStatuses(detail, callback){
  // 重要：此处更新保存out_trade_no，用于退款
  const { id, paidFee, discountFee } = detail;
  const { out_trade_no } = getApp().globalData;

  getApp().globalData.out_trade_no = null;
  updateOrderStatus({ id, ...orderStatus.paid, out_trade_no, paidFee, discountFee }).then(res=>{
    saveStartlist(detail);
    console.log(res);
    wx.showToast({
      icon: 'success',
      title: '报名成功',
      success: async function(){
        if(detail.couponId){
          await updateCouponStatus(detail.couponId);
        }
        await sendEmailSMS(detail);
        await updateRaceCate(detail);
        wx.hideLoading({
          success: (res) => {
            callback && callback();
          },
        })
      }
    })
  })  
}
async function updateCouponStatus(id){
  const { userId, trueName } = getApp().globalData;
  const param = {
    id,
    assignedUserId: userId,
    assignedTrueName: trueName,
    usedTime: new Date(),
    isUsed: true
  }
  const res = await updateCoupon(param)
  const { updated } = res.stats;
  if(updated){
    console.log('优惠券使用成功')
  }
}
function saveStartlist(detail){
  const { isTeamLeader, teamTitle, profiles, id, orderNum, userId, userName, userInfo, orderType, raceId, raceDate, raceType, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no } = detail;
  const db = wx.cloud.database();
  const userTable = db.collection("start-list");
  profiles.forEach(async item=>{
    delete item._openid;
    delete item._id;
    const profileId = item._id;
    console.log(item);
    const { cardNo } = item;
    const existed = await userTable.where({ cateId, cardNo }).get();
    if(existed.data.length === 0){
      const result = await userTable.add({
        data: {
          ...item,
          status: orderStatus.paid.status,
          statusText: orderStatus.paid.statusText, 
          createdAt: new Date(),
          isTeamLeader, teamTitle, id, orderNum, profileId, userId, userName, userInfo, orderType, raceId, raceDate, raceType, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no
        }
      });
      console.log(result)
    }
  })
}

async function sendEmailSMS(order){
  const {
    raceId,
    discountFee,
    raceTitle,
    profiles,
    orderNum,
    cateTitle,
    price,
    totalFee,
    paidFee
  } = order;
  await profiles.forEach(async profile => {
    const { trueName, phoneNum, email } = profile;
    const orderDate = dayjs(new Date()).format("YYYY年MM月DD日 HH:mm:ss");
    const params = { discountFee, orderDate, catePrice: price, cateNum: profiles.length, raceId, raceTitle, orderNum, cateTitle, price, totalFee, paidFee, trueName, phoneNum, email };
    await sendEmail(params);
    await sendSms(params);
  }) 
}
async function sendEmail(order) {
  const {
    raceId,
    raceTitle,
    orderNum,
    cateTitle,
    totalFee,
    paidFee, trueName, email, orderDate, cateNum, catePrice, discountFee
  } = order;
  const values = {
    raceId,
    raceTitle,
    trueName,
    email,
    orderDate,
    orderNum,
    cateNum,
    cateTitle,
    catePrice,
    totalFee,
    discountFee,
    paidFee
  };
  await sendRegEmail(emailTemplateType.registration.value, values);
}

async function sendSms({ phoneNum, trueName, raceId, raceTitle, cateTitle}){
  await sendRegSMS({
    mobile: phoneNum,
    trueName,
    raceId,
    raceTitle,
    cateTitle
  })
};

// 更新race-cates下users
async function updateRaceCate(order){
  const { cateId } = order
  const data = { cateId };
  const res = await wx.cloud.callFunction({
    name: 'updateRaceCate',
    data
  })
  console.log(res);
}