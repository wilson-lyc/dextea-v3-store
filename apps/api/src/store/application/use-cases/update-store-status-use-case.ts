import { BizError } from '@/shared/errors/biz-error.js'
import { logger } from '@/shared/utils/logger.js'
import { StoreErrorCode } from '@/store/domain/errors.js'
import type { StoreRepositoryPort } from '@/store/domain/repositories/store-repository-port.js'
import { storeStatusCode, type StoreStatusCode } from '@dextea/constraints'

export class UpdateStoreStatusUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(id: number, status: number): Promise<void> {
    const store = await this.storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }

    const allowed: StoreStatusCode[] = [storeStatusCode.CLOSED, storeStatusCode.OPEN]
    if (!allowed.includes(status as StoreStatusCode)) {
      throw new BizError(StoreErrorCode.INVALID_STORE_STATUS)
    }

    await this.storeRepository.updateStatus(id, status)
    logger.info(`门店 ${id} 状态已更新为 ${status}`)
  }
}
