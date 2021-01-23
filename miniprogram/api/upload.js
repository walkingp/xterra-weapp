import { getPaginations, getCollectionById } from "../utils/cloud";
const dayjs = require("dayjs");

export const getExcels = async ( raceId, pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'excels',
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
