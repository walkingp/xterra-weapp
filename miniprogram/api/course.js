import { getPaginations } from "../utils/cloud"

export const getCateList = async () => {
  const data = await getPaginations({
    dbName: 'category',
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: 50
  })
  return data;
}

export const getCourseListByCateId = async (cateId) => {
  const data = await getPaginations({
    dbName: 'course',
    filter: {
      isActive: true,
      cateId
    },
    orderBy: {
      endDate: 'desc'
    },
    pageIndex: 1,
    pageSize: 50
  })
  return data;
}

export const getIndexCourseList = async () => {
  const data = await getPaginations({
    dbName: 'course',
    filter: {
      isActive: true
    },
    orderBy: {
      endDate: 'desc'
    },
    pageIndex: 1,
    pageSize: 10
  })
  return data;
}

export const getCourseById = async (id) => {
  const db = wx.cloud.database();
  const course = db.collection('course').doc(id).get();
  return course;
}