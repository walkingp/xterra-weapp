import { getCollectionByWhere, getSingleCollectionByWhere } from "../utils/cloud"

export const searchResultByNameOrPhone = async (key, raceId) => {
  const data = await getCollectionByWhere({ dbName: 'race-result', filter: { phoneNum: key, raceId } });
  return data.length ? data[0] : null;
}

export const getResultDetail = async id => {
  const data = await getSingleCollectionByWhere({ dbName: "race-result", filter: { _id: id} });
  return data;
}

export const updateStartListStatus = async ({cateId, finishedStatus = "done"}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updateStartList',
      data: {
        action: 'batch',
        cateId,
        finishedStatus
      }
    }).then(res => {
      resolve(res.result);
    }).catch(reject)
  })
}