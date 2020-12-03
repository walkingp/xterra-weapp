import { getCollectionByWhere } from "../utils/cloud"

export const getPageDetail = async type => {
  const data = await getCollectionByWhere({ dbName: "page", filter: { type} });
  return data;
}