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
