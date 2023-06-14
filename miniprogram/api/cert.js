import { getCollectionByWhere, getSingleCollectionByWhere } from "../utils/cloud"

export const getPloggingTemplate = async () =>{
  const data = await getCollectionByWhere({ dbName: "cert", filter: { type: 'X-Plogging', isActive: true } });
  return data;
}

export const getCertTemplate = async (raceId, certOrBib = 'cert') => {
  const data = await getSingleCollectionByWhere({ dbName: "cert", filter: { raceId, certOrBib } });
  return data;
}

export const getCertFields = (raceId, isPlogging) => {
  return new Promise(async (resolve, reject) => {
    let cert = null;
    if(isPlogging){
      cert = await getPloggingTemplate();
      cert = cert[0]
     }else{
      cert = await getCertTemplate(raceId);
     }
     if(!cert){
       throw new Error('数据未设置')
     }
    const db = wx.cloud.database();
    const _ = db.command;
    db.collection("cert-field").where({
      _id: _.in(cert.fields)
    }).get().then(res=>{
      resolve(res.data)
    }).catch(err=>reject(err))
  });
}

export const getMillionForrestNum = async () => {
  const db = wx.cloud.database();
  const _ = db.command;
  const userTable = db.collection('race-result');
  const res = await userTable.where({
    millionForrestNo: _.not(_.eq(null))
  }).count();
  const count = res.total;
  const num = new Date().getFullYear() + (count + 1).toString().padStart(5,'0');
  return num;
}