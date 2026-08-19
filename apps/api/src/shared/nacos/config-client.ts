import { NacosConfigClient } from 'nacos'
import { config } from '@/config.js'
import { logger } from '@/shared/utils/logger.js'

export interface NacosConfigClientOptions {
  serverAddr: string
  namespace: string
  group: string
  dataId: string
  username: string
  password: string
}

export const nacosConfigClientOptions: NacosConfigClientOptions = {
  serverAddr: config.nacos.serverAddr,
  namespace: config.nacos.namespace,
  group: config.nacos.group,
  dataId: config.nacos.dataId,
  username: config.nacos.username,
  password: config.nacos.password,
}

export function createNacosConfigClient(): NacosConfigClient {
  const { serverAddr, namespace, username, password } = nacosConfigClientOptions

  const client = new NacosConfigClient({
    serverAddr,
    namespace,
    username,
    password,
  })

  return client
}

export async function getNacosConfig(): Promise<string | null> {
  const client = createNacosConfigClient()
  try {
    await client.ready()
    const content = await client.getConfig(
      nacosConfigClientOptions.dataId,
      nacosConfigClientOptions.group,
    )
    return content
  } catch (err) {
    logger.error('Failed to fetch Nacos config', err)
    return null
  } finally {
    await client.close()
  }
}
