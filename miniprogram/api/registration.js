import { raceStatus } from "../config/const";
import { getPaginations } from "../utils/cloud"
const dayjs = require("dayjs");

export const getAllRegistrationsByRaceId = async (raceId, pageIndex = 1, pageSize = 200) => {
  const data = await getPaginations({
    dbName: 'registration',
    filter: {
      raceId
    },
    field: {
      orderNum: true,
      out_trade_no: true,
      userName: true,
      cateTitle: true,
      statusText: true,
      totalFee: true,
      discountFee: true,
      paidFee: true,
      refundFee: true,
      addedDate: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getAllFailedRegistrations = async (pageIndex = 1, pageSize = 200) => {
  const data = await getPaginations({
    dbName: 'registration',
    filter: {
      status: 2
    },
    field: {
      orderNum: true,
      out_trade_no: true,
      userName: true,
      raceTitle: true,
      cateTitle: true,
      statusText: true,
      totalFee: true,
      discountFee: true,
      paidFee: true,
      refundFee: true,
      addedDate: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getAllStartListByRaceId = async (raceId, pageIndex, pageSize = 200) => {
  const data = await getPaginations({
    dbName: 'start-list',
    filter: {
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