import { getPaginations, getCollectionById, getCollectionByWhere, getSingleCollectionByWhere } from "../utils/cloud"
const dayjs = require("dayjs");

export const getBannerList = async ( position = 'index', size = 5) => {
  const data = await getPaginations({
    dbName: 'banner',
    filter: {
      position,
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

export const getRaceNewsList = async ( raceId, pageIndex = 1, size = 5) => {
  const data = await getPaginations({
    dbName: 'news',
    filter: {
      cate: '赛事',
      raceId,
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex,
    pageSize: size
  })
  return data;
}

export const getRaceCatesList = async ( raceId, size = 20) => {
  const cates = await getPaginations({
    dbName: 'race-cates',
    filter: {
      raceId,
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
     
  cates.map(cate=>{
    const now = dayjs(new Date());
    if(now.isBefore(cate.regEndTime)){if(cate.enableEarlierBirdPrice){
        if(now.isBefore(cate.earlierPriceEndTime)){
          cate.price = cate.earlierBirdPrice;
          cate.priceLabel = '早早鸟价';
        }else{
          cate.price = cate.earlyBirdPrice;
          cate.priceLabel = '早鸟价';
        }
      }else if(cate.enableEarlyBirdPrice){
        if(now.isBefore(cate.earlyPriceEndTime)){
          cate.price = cate.earlyBirdPrice;
          cate.priceLabel = '早鸟价';
        }else{
          cate.price = cate.regPrice;
          cate.priceLabel = '正常价';
        }
      } 
    }else{ // 已超报名截止时间
      cate.expired = true;
      cate.priceLabel = '报名已结束';
    }
    // 格式化
    if(cate.enableEarlierBirdPrice){
      cate.earlierPriceEndTime = dayjs(cate.earlierPriceEndTime).format("YYYY年MM月DD日");
    }
    if(cate.enableEarlyBirdPrice){
      cate.earlyPriceEndTime = dayjs(cate.earlyPriceEndTime).format("YYYY年MM月DD日");
    }

    return cate;
  });
  return cates;
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

export const getMyProfiles = async (userId, size = 20) => {
  const data = await getPaginations({
    dbName: 'profile',
    filter: {
      userId,
    },
    orderBy: {
      createdAt: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getMyCoupons = async (userId, size = 100) => {
  const data = await getPaginations({
    dbName: 'coupon',
    filter: {
      assignedUserId: userId,
    },
    orderBy: {
      _createTime: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getMyRegistrations = async (userId, size = 100) => {
  const data = await getPaginations({
    dbName: 'registration',
    filter: {
      userId,
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getProfileDetail = async id => {
  const data = await getCollectionById({ dbName: 'profile', id });
  return data;
}

export const getRegistrationDetail = async id => {
  const data = await getCollectionById({ dbName: 'registration', id });
  return data;
}

export const getRegistrationByOrderNum = async orderNum => {
  const data = await getCollectionByWhere({ dbName: 'registration', filter: { orderNum } });
  return data.length ? data[0] : null;
}

export const getRegistrationByPhoneNum = async phoneNum => {
  const data = await getCollectionByWhere({ dbName: 'start-list', filter: { phoneNum } });
  return data.length ? data[0] : null;
}

export const getRaceDetail = async id => {
  const data = await getCollectionById({ dbName: 'race', id });
  return data;
}

export const getCouponDetail = async coupon => {
  const data = await getSingleCollectionByWhere({ dbName: 'coupon', filter: { coupon }});
  return data;
}

export const updateCoupon = async param => {
  const { id } = param;
  delete param.id;
  const db = wx.cloud.database();
  const result = await db.collection("coupon").doc(id).update({
    data: {
      ...param
    }
  });
  debugger
  return result;
};

export const updateOrderStatus = async param => {
  const { id, status, statusText, out_trade_no, refundTime } = param;
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updateOrder',
      data: {
        id,
        status,
        statusText,
        out_trade_no,
        refundTime
      }
    }).then(res => {
      resolve(res.result);
    }).catch(reject)
  })
}