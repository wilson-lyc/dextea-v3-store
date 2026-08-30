import { StoreStatus, type StoreStatusCode } from '@dextea/constraints'

export class Store {
  public constructor(
    public readonly id: number,
    public readonly account: string,
    public readonly password: string,
    public readonly name: string,
    public readonly province: string,
    public readonly city: string,
    public readonly district: string,
    public readonly address: string,
    public readonly status: StoreStatusCode,
    public readonly businessHours: string,
    public readonly phone: string,
    public readonly longitude: number,
    public readonly latitude: number,
    public readonly email: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  public isAvailable(): boolean {
    return this.status !== StoreStatus.keyMap.DEFUNCT
  }
}
