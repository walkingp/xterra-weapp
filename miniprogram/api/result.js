import { getCollectionByWhere, getSingleCollectionByWhere } from "../utils/cloud"

export const searchResultByNameOrPhone = async (key, raceId) => {
  const data = await getCollectionByWhere({ dbName: 'race-result', filter: { phoneNum: key, raceId } });
  return data.length ? data[0] : null;
}

export const getResultDetail = async id => {
  const data = await getSingleCollectionByWhere({ dbName: "race-result", filter: { _id: id} });
  return data;
}