import { defineBizErrors } from '@/shared/errors.js'

export const authErrors = defineBizErrors({
  INVALID_CREDENTIALS: { status: 401, message: '账号或密码错误' },
  STORE_DISABLED: { status: 403, message: '门店已停用，无法登录' },
})
