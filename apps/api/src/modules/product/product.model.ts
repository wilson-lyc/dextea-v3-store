import { ProductGlobalStatus, type ProductGlobalStatusCode } from '@dextea/constraints'

export class Product {
  public constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly status: ProductGlobalStatusCode,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  public isGloballyActive(): boolean {
    return this.status === ProductGlobalStatus.keyMap.ACTIVE
  }
}
