import dayjs from "dayjs";
import { orderStatus } from "../config/const";
import { sendRegEmail } from "./email";
import { updateOrderStatus } from "./race";

export const payNow = function(detail, callback) {
  wx.showLoading({
    title: '支付中',
  })
  const that = this;
  const nonceStr = Math.random().toString(36).substr(2, 15)
  const timeStamp = parseInt(Date.now() / 1000) + ''
  const out_trade_no = "otn" + nonceStr + timeStamp
  const total_fee = (detail.totalFee*100).toString();

  getApp().globalData.out_trade_no = out_trade_no;

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
          // 重要：此处更新保存out_trade_no，用于退款
          const { id } = detail;
          const { out_trade_no } = getApp().globalData;

          getApp().globalData.out_trade_no = null;
          updateOrderStatus({ id, ...orderStatus.paid, out_trade_no }).then(res=>{
            saveStartlist(detail);
            console.log(res);
            wx.showToast({
              icon: 'success',
              title: '支付成功',
              success: async function(){
                await sendEmail(detail);
                wx.hideLoading({
                  success: (res) => {
                    callback();
                  },
                })
              }
            })
          })
        }
      })
    },
    fail(res) {
      console.log("支付失败：", res);
      updateOrderStatus({ id: detail.id, ...orderStatus.failed }).then(res=>{
        console.log(res);
        wx.showToast({
          icon: 'none',
          title: '支付失败',
          success: function(){
            wx.redirectTo({
              url: `/pages/register/status/status?id=${order._id}`,
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
function saveStartlist(detail){
  const { profiles, id, orderNum, userId, userName, userInfo, status, statusText, orderType, raceId, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no } = detail;

  const db = wx.cloud.database();
  profiles.forEach(async item=>{
    delete item._openid;
    delete item._id;
    console.log(item);
    const result = await db.collection("start-list").add({
      data: {
        ...item,
        createdAt: new Date(),
        id, orderNum, userId, userName, userInfo, status, statusText, orderType, raceId, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no
      }
    });
    console.log(result)
  })
}
function sendEmail(order) {
  const {
    raceId,
    raceTitle,
    profiles,
    orderNum,
    cateTitle,
    price,
    totalFee,
    paidFee
  } = order;
  const values = {
    raceId,
    raceTitle,
    trueName: profiles[0].trueName,
    email: profiles[0].email,
    orderDate: dayjs(new Date()).format("YYYY年MM月DD日 HH:mm:ss"),
    orderNum,
    cateNum: profiles.length,
    cateTitle,
    catePrice: price,
    totalFee,
    paidFee
  };
  return sendRegEmail(values);
}