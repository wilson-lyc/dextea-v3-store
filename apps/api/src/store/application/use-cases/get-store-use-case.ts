import { BizError } from '@/shared/errors/biz-error.js'
import { StoreErrorCode } from '@/store/domain/errors.js'
import type { StoreRepositoryPort } from '@/store/domain/repositories/store-repository-port.js'
import { toStoreView, type StoreView } from '@/store/application/dtos/store-dto.js'

export class GetStoreUseCase {
  constructor(private readonly storeRepository: StoreRepositoryPort) {}

  async execute(id: number): Promise<StoreView> {
    const store = await this.storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }
    return toStoreView(store)
  }
}
