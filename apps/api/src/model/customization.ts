import {
  customizationItemStatusCode,
  customizationOptionGlobalStatusCode,
  type CustomizationItemStatusCode,
  type CustomizationOptionGlobalStatusCode,
} from '@dextea/constraints'

export class CustomizationItem {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly name: string,
    public readonly sort: number,
    public readonly status: CustomizationItemStatusCode,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  isGloballyActive(): boolean {
    return this.status === customizationItemStatusCode.ITEM_ACTIVE
  }
}

export class CustomizationOption {
  constructor(
    public readonly id: number,
    public readonly itemId: number,
    public readonly name: string,
    public readonly price: number,
    public readonly sort: number,
    public readonly status: CustomizationOptionGlobalStatusCode,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  isGloballyActive(): boolean {
    return this.status === customizationOptionGlobalStatusCode.GLOBAL_ACTIVE
  }
}
