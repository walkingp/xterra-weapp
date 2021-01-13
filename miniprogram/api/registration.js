import { getPaginations } from "../utils/cloud"
const dayjs = require("dayjs");

export const getAllRegistrationsByRaceId = async (raceId, size = 1000) => {
  const data = await getPaginations({
    dbName: 'registration',
    filter: {
      raceId
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getAllStartListByRaceId = async (raceId, size = 1000) => {
  const data = await getPaginations({
    dbName: 'start-list',
    filter: {
      raceId
    },
    orderBy: {
      createdAt: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}