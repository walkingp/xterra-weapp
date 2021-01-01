import { getCollectionByWhere, getSingleCollectionByWhere } from "../utils/cloud"

export const searchResultByNameOrPhone = async (key, raceId) => {
  const data = await getSingleCollectionByWhere({ dbName: 'race-result', filter: { phoneNum: key, raceId } });
  return data;
}

export const searchPloggingResultByNameOrPhone = async (key, raceId) => {
  const data = await getSingleCollectionByWhere({ dbName: 'start-list', filter: { phoneNum: key, raceId } });
  return data;
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