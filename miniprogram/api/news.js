import { getPaginations } from "../utils/cloud"

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
    pageSize: 2
  })
  return data;
}