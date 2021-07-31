import { removeCollectionById } from "../utils/cloud";

export const getCateFormFields = async ( cateId, size = 500) => {  
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getCateFormFields',
      data: { cateId },
      success: res => {
        if(res.result.list && res.result.list.length){
          resolve(res.result.list[0]);
        }
        reject([])
      },
      fail: err => reject(err)
    });
  });
}

export const removeProfile = async (id) => {
  return new Promise(async (resolve, reject) => {
    const res = await removeCollectionById({ dbName: 'profile', id });
    resolve(res);
  });
};