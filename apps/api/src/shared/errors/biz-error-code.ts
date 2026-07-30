export class BizErrorCode {
  public constructor(
    public readonly code: number,
    public readonly message: string,
  ) {}

  public toString(): string {
    return `${this.code}: ${this.message}`
  }
}
