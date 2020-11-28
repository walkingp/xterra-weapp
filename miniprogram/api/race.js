import { getPaginations } from "../utils/cloud"

export const getBannerList = async () => {
  const data = await getPaginations({
    dbName: 'banner',
    filter: {
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: 5
  })
  return data;
}