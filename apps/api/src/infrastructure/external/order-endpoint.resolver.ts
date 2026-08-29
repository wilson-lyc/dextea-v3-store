import { getConfig } from '@/config/index.js'
import { getLogger } from '@/shared/logger.js'
import { getNacosNamingClient } from '@/infrastructure/nacos/naming-client.js'
import {
  NacosServiceDiscovery,
  type ServiceDiscovery,
} from '@/infrastructure/nacos/service-discovery.js'
import {
  OrderServiceEndpointUnavailableError,
  type OrderServiceEndpointResolver,
} from '@/modules/order/order.endpoint-resolver.js'

export class StaticOrderServiceEndpointResolver implements OrderServiceEndpointResolver {
  private readonly logger = getLogger()

  public async resolveBaseUrl(): Promise<string> {
    const { baseUrl } = getConfig().orderService

    if (!baseUrl) {
      this.logger.error(
        '[order-resolver] 未配置 ORDER_SERVICE_BASE_URL，且 Nacos 服务发现未启用'
      )
      throw new OrderServiceEndpointUnavailableError(
        '未配置 ORDER_SERVICE_BASE_URL，且 Nacos 服务发现未启用'
      )
    }

    return baseUrl
  }
}

export class NacosOrderServiceEndpointResolver implements OrderServiceEndpointResolver {
  private readonly logger = getLogger()

  public constructor(private readonly discovery?: ServiceDiscovery) {}

  public async resolveBaseUrl(): Promise<string> {
    const config = getConfig()
    const serviceName = config.orderService.serviceName
    const discovery =
      this.discovery ??
      new NacosServiceDiscovery(await getNacosNamingClient(), {
        group: config.nacos.group,
        clusters: config.nacos.clusters,
        defaultScheme: config.orderService.scheme,
      })

    let baseUrl: string | null

    try {
      baseUrl = await discovery.selectOneHealthyBaseUrl(serviceName)
    } catch (error) {
      this.logger.error(
        { error, serviceName },
        '[order-resolver] 从 Nacos 解析订单微服务地址失败'
      )
      throw new OrderServiceEndpointUnavailableError('从 Nacos 解析订单微服务地址失败', {
        cause: error,
      })
    }

    if (!baseUrl) {
      this.logger.error(
        { serviceName, group: config.nacos.group },
        '[order-resolver] Nacos 中没有可用的订单微服务实例'
      )
      throw new OrderServiceEndpointUnavailableError(
        `Nacos 中没有可用的订单微服务实例: ${serviceName}`
      )
    }

    return baseUrl
  }
}

export function createOrderServiceEndpointResolver(): OrderServiceEndpointResolver {
  return getConfig().nacos.enabled
    ? new NacosOrderServiceEndpointResolver()
    : new StaticOrderServiceEndpointResolver()
}
