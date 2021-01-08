import { getCollectionByWhere, getSingleCollectionByWhere } from "../utils/cloud"

export const searchResultByNameOrPhone = async (cardNo, id, isPlogging) => {
  const filter = isPlogging ? { cardNo, cateId: id } : { cardNo, raceId: id }
  const data = await getSingleCollectionByWhere({ dbName: 'race-result', filter});
  return data;
}

export const getResultDetail = async id => {
  const data = await getSingleCollectionByWhere({ dbName: "race-result", filter: { _id: id} });
  return data;
}

export const updateStartListStatus = async ({cateId, city, finishedStatus = "done"}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updateStartList',
      data: {
        action: 'batch',
        city,
        cateId,
        finishedStatus
      }
    }).then(res => {
      resolve(res.result);
      wx.showToast({
        icon: 'success',
        title: '操作成功',
      })
    }).catch(err=>{
      wx.showToast({
        icon: 'none',
        title: '操作失败',
      })
      console.error(err)
    })
  })
}

export const getUserListByTeam = async ({cateId, teamTitle}) => {
  const data = await getCollectionByWhere({ dbName: 'start-list', filter: { teamTitle, cateId } });
  return data;
}

export const updateStartListStatusByUser = async ({cateId, cardNo, city, finishedStatus = "done"}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updateStartList',
      data: {
        action: 'single',
        cardNo,
        cateId,
        city,
        finishedStatus
      }
    }).then(res => {
      resolve(res.result);
    }).catch(err => {
      console.error(err);
    })
  })
}