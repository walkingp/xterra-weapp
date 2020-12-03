import { getCollectionById, getPaginations } from "../utils/cloud"

export const getFeedIndexList = async ( status) => {
  const data = await getPaginations({
    dbName: 'feed',
    filter: {
      status: status.toString()
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex: 1,
    pageSize: 10
  })
  return data;
}
