import { getPaginations, getCollectionById } from "../utils/cloud";
const dayjs = require("dayjs");

export const getCommentList = async ( feedId, pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'reply',
    filter: {
      feedId
    },
    orderBy: {
      createdAt: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}