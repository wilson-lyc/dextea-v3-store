import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/types/api-response.js'
import type { CustomizationService } from '@/service/customization-service.js'
import {
  listProductCustomizationsRequestSchema,
  updateCustomizationOptionStoreStatusRequestSchema,
} from '@dextea/constraints'
import type { CustomizationOptionStoreStatusCode } from '@dextea/constraints'

interface ListCustomizationsParams {
  productId: string
}

interface ListCustomizationsQuery {
  storeId?: string
}

interface UpdateOptionStoreStatusParams {
  optionId: string
}

interface UpdateOptionStoreStatusBody {
  status?: unknown
}

export class CustomizationController {
  public constructor(private readonly customizationService: CustomizationService) {}

  public async listProductCustomizations(
    request: FastifyRequest<{ Params: ListCustomizationsParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const query = request.query as ListCustomizationsQuery
    const parsed = listProductCustomizationsRequestSchema.safeParse({
      productId: request.params.productId,
      storeId: query.storeId ?? request.headers['x-store-id'],
    })

    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.issues[0]?.message ?? '请求参数无效' })
    }

    const result = await this.customizationService.listByProductAndStore(
      parsed.data.productId,
      parsed.data.storeId,
    )
    return reply.send(success(result))
  }

  public async updateOptionStoreStatus(
    request: FastifyRequest<{
      Params: UpdateOptionStoreStatusParams
      Body: UpdateOptionStoreStatusBody
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const storeId = request.headers['x-store-id']
    const parsed = updateCustomizationOptionStoreStatusRequestSchema.safeParse({
      optionId: request.params.optionId,
      storeId,
      status: request.body?.status,
    })

    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.issues[0]?.message ?? '请求参数无效' })
    }

    const storeStatus = await this.customizationService.updateOptionStoreStatus(
      parsed.data.optionId,
      parsed.data.storeId,
      parsed.data.status as CustomizationOptionStoreStatusCode,
    )
    return reply.send(success({ storeStatus }))
  }

  public registerRoutes(fastify: FastifyInstance): void {
    fastify.get('/:productId/customizations', this.listProductCustomizations.bind(this))
    fastify.patch(
      '/customizations/options/:optionId/store-status',
      this.updateOptionStoreStatus.bind(this),
    )
  }
}
