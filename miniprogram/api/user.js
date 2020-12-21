import { getCollectionById } from "../utils/cloud";

export const getUserDetail = async id => {
  const data = await getCollectionById({ dbName: 'userlist', id });
  return data;
}
