import { defineBizErrors } from '@/shared/errors.js'

export const storeErrors = defineBizErrors({
  STORE_NOT_FOUND: { status: 404, message: '门店不存在' },
  INVALID_STORE_STATUS: { status: 400, message: '门店状态仅支持休息中或营业中' },
  OLD_PASSWORD_INCORRECT: { status: 400, message: '原密码不正确' },
  SAME_AS_OLD_PASSWORD: { status: 400, message: '新密码不能与原密码相同' },
})
