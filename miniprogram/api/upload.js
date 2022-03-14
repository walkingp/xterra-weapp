import { getPaginations, getCollectionById } from "../utils/cloud";
const dayjs = require("dayjs");

export const getExcels = async ( raceId, pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'excels',
    filter: {
      raceId
    },
    orderBy: {
      _createTime: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}


export const getResultExcel = async ( raceId, pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'results',
    filter: {
      raceId
    },
    orderBy: {
      _createTime: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getImportedUsers = async ( raceId, pageIndex = 1, pageSize = 1000) => {
  const data = await getPaginations({
    dbName: 'start-list',
    filter: {
      orderType: '线下团报',
      raceId
    },
    orderBy: {
      createdAt: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const gpxToJson = async (gpxCloudUrl) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'gpxToJson',
      data: {
        gpxCloudUrl
      },
      success: res => {
        resolve(res);
      },
      fail: err => reject(err)
    });
  });
}