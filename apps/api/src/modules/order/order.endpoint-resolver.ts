export class OrderServiceEndpointUnavailableError extends Error {
  public constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'OrderServiceEndpointUnavailableError'
  }
}

export interface OrderServiceEndpointResolver {
  resolveBaseUrl(): Promise<string>
}
