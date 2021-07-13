import { getCollectionById, getPaginations } from "../utils/cloud"

export const getCityList = async ( order = 'desc', pageIndex = 1, pageSize = 20) => {
  const data = await getPaginations({
    dbName: 'city',
    filter: {
      isActive: true
    },
    orderBy: {
      order
    },
    pageIndex,
    pageSize
  })
  return data;
}