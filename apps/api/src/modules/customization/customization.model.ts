import {
  CustomizationItemStatus,
  CustomizationOptionGlobalStatus,
  type CustomizationItemStatusCode,
  type CustomizationOptionGlobalStatusCode,
} from '@dextea/constraints'

export class CustomizationItem {
  public constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly name: string,
    public readonly sort: number,
    public readonly status: CustomizationItemStatusCode,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  public isGloballyActive(): boolean {
    return this.status === CustomizationItemStatus.keyMap.ACTIVE
  }
}

export class CustomizationOption {
  public constructor(
    public readonly id: number,
    public readonly itemId: number,
    public readonly name: string,
    public readonly price: number,
    public readonly sort: number,
    public readonly status: CustomizationOptionGlobalStatusCode,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  public isGloballyActive(): boolean {
    return this.status === CustomizationOptionGlobalStatus.keyMap.ACTIVE
  }
}
