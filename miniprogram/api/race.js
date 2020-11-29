import { getPaginations, getCollectionById } from "../utils/cloud"

export const getBannerList = async ( size = 5) => {
  const data = await getPaginations({
    dbName: 'banner',
    filter: {
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getRaceIndexList = async ( size = 2) => {
  const data = await getPaginations({
    dbName: 'race',
    orderBy: {
      raceDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getRaceDetail = async id => {
  const data = await getCollectionById({ dbName: 'race', id });
  return data;
}