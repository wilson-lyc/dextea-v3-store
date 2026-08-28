import { defineBizErrors } from '@/shared/errors.js'

export const customizationErrors = defineBizErrors({
  OPTION_NOT_FOUND: { status: 404, message: '客制化选项不存在' },
})
