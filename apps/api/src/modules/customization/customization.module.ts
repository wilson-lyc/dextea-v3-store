import { z } from 'zod'
import {
  apiEnvelopeSchema,
  customizationItemViewSchema,
  CustomizationOptionStoreStatus,
  updateCustomizationOptionStoreStatusRequestSchema,
} from '@dextea/constraints'

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { requireStoreId } from '@/interfaces/http/store-context.js'
import { success } from '@/interfaces/http/response.js'
import {
  toCustomizationItemView,
  toCustomizationOptionView,
} from './customization.presenter.js'
import type { CustomizationService } from './customization.service.js'

const productIdParamsSchema = z.object({
  productId: z.coerce.number().int().positive({ message: '商品ID无效' }),
})

const optionIdParamsSchema = z.object({
  optionId: z.coerce.number().int().positive({ message: '客制化选项ID无效' }),
})

const itemListResponseSchema = apiEnvelopeSchema(z.array(customizationItemViewSchema))
const storeStatusResponseSchema = apiEnvelopeSchema(
  z.object({ storeStatus: CustomizationOptionStoreStatus.schema() })
)

export interface CustomizationModuleOptions {
  customizationService: CustomizationService
}

export function createCustomizationRoutes(
  options: CustomizationModuleOptions
): FastifyPluginAsyncZod {
  const { customizationService } = options

  return async (app) => {
    app.get(
      '/:productId/customizations',
      {
        schema: {
          params: productIdParamsSchema,
          response: { 200: itemListResponseSchema },
        },
      },
      async (request, reply) => {
        const items = await customizationService.listByProductAndStore(
          request.params.productId,
          requireStoreId(request)
        )

        return reply.send(
          success(
            items.map((entry) =>
              toCustomizationItemView(
                entry.item,
                entry.options.map((option) =>
                  toCustomizationOptionView(option.option, option.storeStatus)
                )
              )
            )
          )
        )
      }
    )

    app.patch(
      '/customizations/options/:optionId/store-status',
      {
        schema: {
          params: optionIdParamsSchema,
          body: updateCustomizationOptionStoreStatusRequestSchema,
          response: { 200: storeStatusResponseSchema },
        },
      },
      async (request, reply) => {
        const storeStatus = await customizationService.updateOptionStoreStatus(
          request.params.optionId,
          requireStoreId(request),
          request.body.status
        )

        return reply.send(success({ storeStatus }))
      }
    )
  }
}
