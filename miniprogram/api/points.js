
import { getPaginations } from "../utils/cloud";

export const updatePoint = (userId, type, extraData) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updatePoints',
      data: {
        userId,
        type,
        extraData
      },
      success: res => {
        // 清除缓存
        resolve(res.result)
      },
      fail: err=> reject(err)
    });
  });
}

export const getPointGoodsIndexList = async ( pageIndex = 1, pageSize = 10) => {
  const data = await getPaginations({
    dbName: 'goods',
    filter: {
      isActive: true
    },
    orderBy: {
      exchangedCount: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}