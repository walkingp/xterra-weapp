import { getCollectionById, getPaginations } from "../utils/cloud"

export const getNewsIndexList = async () => {
  const data = await getPaginations({
    dbName: 'news',
    filter: {
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: 9
  })
  return data;
}

export const getNewsDetail = async id => {
  const data = await getCollectionById({ dbName: "news", id});
  return data;
}