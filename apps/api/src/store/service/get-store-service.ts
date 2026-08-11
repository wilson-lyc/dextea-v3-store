import { BizError } from '@/shared/errors/biz-error.js'
import { StoreErrorCode } from '@/store/error.js'
import { toStoreView, type StoreView } from '@/store/mapper/store-mapper.js'
import type { StoreRepository } from '@/store/repository/store-repository.js'

export class GetStoreService {
  constructor(private readonly storeRepository: StoreRepository) {}

  async execute(id: number): Promise<StoreView> {
    const store = await this.storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }
    return toStoreView(store)
  }
}
