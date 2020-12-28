import { getPaginations, getCollectionById } from "../utils/cloud"

export const getCouponList = async ( pageIndex = 1, pageSize = 100) => {
  const data = await getPaginations({
    dbName: 'coupon',
    orderBy: {
      _createTime: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getCouponDetail = async id => {
  const data = await getCollectionById({ dbName: 'coupon', id });
  return data;
}