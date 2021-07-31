import {
  getCollectionById,
  getCollectionByWhere,
  getPaginations
} from "../utils/cloud"

export const getCityList = async (order = 'desc', pageIndex = 1, pageSize = 20) => {
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
  const data = await getCollectionById({
    dbName: 'city',
    id
  });
  return data;
}

export const getPlaceDetail = async id => {
  const data = await getCollectionById({
    dbName: 'place',
    id
  });
  return data;
}

export const getCityDetailByName = async name => {
  const data = await getCollectionByWhere({
    dbName: 'city',
    filter: {
      cityCN: name
    }
  });
  return data;
}
export const getPlaceList = async (cityId, order = 'desc', pageIndex = 1, pageSize = 20) => {
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
export const getRaceListByPlace = async (placeId, pageIndex = 1, pageSize = 20) => {
  const data = await getPaginations({
    dbName: 'race',
    filter: {
      placeId,
      type: 'X-Discovery',
      isActive: true
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const tickPlace = async (placeId, userId) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'tickMedal',
      data: {
        userId,
        placeId
      },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    })
  });
};

export const checkIsTicked = async (placeId, userId) => {
  const db = wx.cloud.database()
  const res = await db.collection("medals").where({
    placeId,
    userId
  }).get();
  return res.data.length > 0;
};

export const favPlace = async (placeId, userId) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'favPlace',
      data: {
        userId,
        placeId,
        type: 'place'
      },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    })
  });
};

export const checkIsFaved = async (placeId, userId) => {
  const db = wx.cloud.database()
  const res = await db.collection("fav").where({
    placeId,
    userId
  }).get();
  return res.data.length > 0;
};