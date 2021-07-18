import { getCollectionById, getCollectionByWhere, getPaginations } from "../utils/cloud"

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

export const getCityDetail = async id => {
  const data = await getCollectionById({ dbName: 'city', id });
  return data;
}

export const getPlaceDetail = async id => {
  const data = await getCollectionById({ dbName: 'place', id });
  return data;
}

export const getCityDetailByName = async name => {
  const data = await getCollectionByWhere({ dbName: 'city', filter: { cityEn: name }});
  return data;
}
export const getPlaceList = async ( cityId, order = 'desc', pageIndex = 1, pageSize = 20) => {
  const data = await getPaginations({
    dbName: 'place',
    filter: {
      city: cityId,
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
export const getRaceListByPlace = async ( placeId, pageIndex = 1, pageSize = 20) => {
  const data = await getPaginations({
    dbName: 'race',
    filter: {
      placeId,
      type: 'XD',
      isActive: true
    },
    pageIndex,
    pageSize
  })
  return data;
}