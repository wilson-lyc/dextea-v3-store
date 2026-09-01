export const apiRoutes = {
  auth: {
    login: () => '/api/v1/auth/login',
  },
  store: {
    current: () => '/api/v1/store/',
    status: () => '/api/v1/store/status',
    password: () => '/api/v1/store/password',
    events: () => '/api/v1/store/events',
  },
  product: {
    list: () => '/api/v1/products/',
    storeStatus: (productId: number) => `/api/v1/products/${productId}/store-status`,
    batchStoreStatus: () => '/api/v1/products/batch/store-status',
  },
  customization: {
    listByProduct: (productId: number) =>
      `/api/v1/products/${productId}/customizations`,
    optionStoreStatus: (optionId: number) =>
      `/api/v1/products/customizations/options/${optionId}/store-status`,
  },
  order: {
    window: () => '/api/v1/store/orders/window',
    detail: (orderId: number) => `/api/v1/store/orders/${orderId}`,
    ready: (orderId: number) => `/api/v1/store/orders/${orderId}/ready`,
    collect: (orderId: number) => `/api/v1/store/orders/${orderId}/collect`,
  },
} as const
