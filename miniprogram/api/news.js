import { getCollectionById, getPaginations } from "../utils/cloud"

export const getNewsIndexList = async (pageIndex = 1, pageSize = 10) => {
  const data = await getPaginations({
    dbName: 'news',
    filter: {
      isActive: true
    },
    orderBy: {
      order: 'desc',
      _createdTime: 'desc'
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