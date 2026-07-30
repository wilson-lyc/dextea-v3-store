import { productGlobalStatusCode, type ProductGlobalStatusCode } from '@dextea/constraints'

export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly image: string | null,
    public readonly status: ProductGlobalStatusCode,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}

  isGloballyActive(): boolean {
    return this.status === productGlobalStatusCode.GLOBAL_ACTIVE
  }
}
