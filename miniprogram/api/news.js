import { getCollectionById, getPaginations } from "../utils/cloud"

export const getNewsIndexList = async ( order = 'desc', pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'news',
    filter: {
      isActive: true
    },
    orderBy: {
      order: 'desc',
      postTime: order
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getNewsDetail = async id => {
  const data = await getCollectionById({ dbName: "news", id});
  return data;
}