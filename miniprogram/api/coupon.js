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
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'exportCoupon',
        data: {
          isUsed
        },
        success(res) {
          resolve(res.result)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}