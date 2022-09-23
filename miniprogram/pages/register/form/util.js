export function checkIDCard (idcode) {
  // 加权因子
  const weightFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  // 校验码
  const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  const code = String(idcode)
  const last = idcode[17]// 最后一位

  const seventeen = code.substring(0, 17)

  // ISO 7064:1983.MOD 11-2 判断最后一位校验码是否正确
  const arr = seventeen.split('')
  const len = arr.length
  let num = 0
  for (let i = 0; i < len; i++) {
    num = num + arr[i] * weightFactor[i]
  }

  // 获取余数
  const resisue = num % 11
  const lastNo = checkCode[resisue]

  // 身份证号格式的正则思路
  const idcardPatter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/

  // 判断格式是否正确
  const format = idcardPatter.test(idcode)

  // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
  return last === lastNo && format
}