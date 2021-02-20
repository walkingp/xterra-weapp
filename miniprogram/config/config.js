const config = {
  env: 'xterra-c2969f',
  appId: 'wx491fb14c7948a753',
  appTitle: 'XTERRA',
  appDescription: 'XTERRA官方小程序',
  mapKey: 'YOWBZ-MK263-F7G3H-YWGGY-RGHKQ-ACFNH',
  storageKey: {
    kits: 'xterra.kits',
    searchHistory: 'searchHistory'
  },
  messageTemplates: {
    registration: {
      title: '赛事活动报名通知',
      templateId: 'FGiibaRONUAlefM3TA4s-enx4skhLNmFM-MY6yuEKLI',
      templateNo: 2150,
      fields: [
        {
          key: 'name1',
          name: '姓名'
        },
        {
          key: 'phone_number2',
          name: '手机'
        },
        {
          key: 'thing3',
          name: '赛事名称'
        },
        {
          key: 'amount4',
          name: '参赛金额'
        },
        {
          key: 'time5',
          name: '参赛时间'
        },
      ]
    },
    cancel: {
      title: '赛事活动取消通知',
      templateId: 'URnfH_zgJQjLNp2ocUIwGOVRoY7cppOfRh9PisXxdQE',
      templateNo: 13999,
      fields: [
        {
          key: 'thing1',
          name: '活动名称'
        },
        {
          key: 'time2',
          name: '活动时间'
        },
        {
          key: 'thing3',
          name: '取消原因'
        },
        {
          key: 'thing4',
          name: '取消人'
        },
        {
          key: 'thing5',
          name: '备注'
        }
      ]
    },
  }
};

module.exports = config;