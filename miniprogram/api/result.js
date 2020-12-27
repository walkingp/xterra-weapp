import { getCollectionByWhere } from "../utils/cloud"

export const searchResultByNameOrPhone = async (key, raceId) => {
  const data = await getCollectionByWhere({ dbName: 'race-result', filter: { phoneNum: key, raceId } });
  return data.length ? data[0] : null;
}