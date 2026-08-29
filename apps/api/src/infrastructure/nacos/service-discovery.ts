import type { Host, NacosNamingClient } from 'nacos'
import { NacosDiscoveryError } from './naming-client.js'

export interface ServiceDiscoveryOptions {
  group: string
  clusters: string
  defaultScheme: 'http' | 'https'
}

export interface ServiceDiscovery {
  selectOneHealthyBaseUrl(serviceName: string): Promise<string | null>
}

export class NacosServiceDiscovery implements ServiceDiscovery {
  public constructor(
    private readonly client: NacosNamingClient,
    private readonly options: ServiceDiscoveryOptions
  ) {}

  public async selectOneHealthyBaseUrl(serviceName: string): Promise<string | null> {
    let hosts: Host[]

    try {
      // selectInstances(healthy=true) 已过滤掉不健康、未启用、权重为 0 的实例
      hosts = await this.client.selectInstances(
        serviceName,
        this.options.group,
        this.options.clusters,
        true,
        true
      )
    } catch (error) {
      throw new NacosDiscoveryError(`从 Nacos 查询服务 ${serviceName} 的实例列表失败`, {
        cause: error,
      })
    }

    const selected = pickByWeight(hosts)

    return selected ? toBaseUrl(selected, this.options.defaultScheme) : null
  }
}

function pickByWeight(hosts: Host[]): Host | undefined {
  if (hosts.length === 0) {
    return undefined
  }

  const total = hosts.reduce((sum, host) => sum + host.weight, 0)

  if (total <= 0) {
    return hosts[Math.floor(Math.random() * hosts.length)]
  }

  let cursor = Math.random() * total

  for (const host of hosts) {
    cursor -= host.weight
    if (cursor <= 0) {
      return host
    }
  }

  return hosts[hosts.length - 1]
}

function toBaseUrl(host: Host, fallbackScheme: 'http' | 'https'): string {
  const scheme = host.metadata?.scheme

  const normalized =
    typeof scheme === 'string' && (scheme === 'http' || scheme === 'https')
      ? scheme
      : fallbackScheme

  return `${normalized}://${host.ip}:${host.port}`
}
