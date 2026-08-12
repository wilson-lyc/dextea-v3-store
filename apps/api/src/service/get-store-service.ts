import { BizError } from '@/shared/errors/biz-error.js'
import { StoreErrorCode } from '@/error/store-error.js'
import { toStoreView, type StoreView } from '@/mapper/store-mapper.js'
import { storeRepository } from '@/repository/store-repository.js'

export class GetStoreService {
  async execute(id: number): Promise<StoreView> {
    const store = await storeRepository.findById(id)
    if (!store) {
      throw new BizError(StoreErrorCode.STORE_NOT_FOUND)
    }
    return toStoreView(store)
  }
}

export const getStoreService = new GetStoreService()
