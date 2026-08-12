import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { StoreErrorCode } from '@/error/store-error.js'
import { storeRepository } from '@/repository/store-repository.js'
import { storeStatusCode, type StoreStatusCode } from '@dextea/constraints'

export class UpdateStoreStatusService {
  async execute(id: number, status: number): Promise<void> {
    const allowed: StoreStatusCode[] = [storeStatusCode.CLOSED, storeStatusCode.OPEN]
    if (!allowed.includes(status as StoreStatusCode)) {
      throw new BizError(StoreErrorCode.INVALID_STORE_STATUS)
    }

    const store = await storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }

    await storeRepository.updateStatus(id, status)
    logger.info(`门店 ${id} 状态已更新为 ${status}`)
  }
}

export const updateStoreStatusService = new UpdateStoreStatusService()
