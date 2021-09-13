<<<<<<< HEAD
import {
  getCollectionById,
  getCollectionByWhere,
  getPaginations
} from "../utils/cloud"

export const getCityList = async (order = 'desc', pageIndex = 1, pageSize = 20) => {
=======
import { getCollectionById, getCollectionByWhere, getPaginations } from "../utils/cloud"

export const getCityList = async ( order = 'desc', pageIndex = 1, pageSize = 20) => {
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
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
<<<<<<< HEAD
  const data = await getCollectionById({
    dbName: 'city',
    id
  });
=======
  const data = await getCollectionById({ dbName: 'city', id });
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
  return data;
}

export const getPlaceDetail = async id => {
<<<<<<< HEAD
  const data = await getCollectionById({
    dbName: 'place',
    id
  });
=======
  const data = await getCollectionById({ dbName: 'place', id });
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
  return data;
}

export const getCityDetailByName = async name => {
<<<<<<< HEAD
  const data = await getCollectionByWhere({
    dbName: 'city',
    filter: {
      cityCN: name
    }
  });
  return data;
}
export const getPlaceList = async (cityId, order = 'desc', pageIndex = 1, pageSize = 20) => {
=======
  const data = await getCollectionByWhere({ dbName: 'city', filter: { cityEn: name }});
  return data;
}
export const getPlaceList = async ( cityId, order = 'desc', pageIndex = 1, pageSize = 20) => {
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
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
<<<<<<< HEAD
export const getRaceListByPlace = async (placeId, pageIndex = 1, pageSize = 20) => {
=======
export const getRaceListByPlace = async ( placeId, pageIndex = 1, pageSize = 20) => {
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
  const data = await getPaginations({
    dbName: 'race',
    filter: {
      placeId,
<<<<<<< HEAD
      type: 'X-Discovery',
=======
      type: 'XD',
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
      isActive: true
    },
    pageIndex,
    pageSize
  })
  return data;
<<<<<<< HEAD
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
=======
}
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
