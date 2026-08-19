import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { success } from '@/shared/types/api-response.js'
import type { AuthService } from '@/service/auth-service.js'
import type { StoreService } from '@/service/store-service.js'
import type { LoginRequest, ResetPasswordRequest, UpdateStoreStatusRequest } from '@dextea/constraints'

interface StoreParams {
  id: string
}

export class StoreController {
  public constructor(
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
  ) {}

  public async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply): Promise<void> {
    const { token, storeId } = await this.authService.login(request.body)
    return reply.send(success({ token, storeId }))
  }

  public async getById(
    request: FastifyRequest<{ Params: StoreParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const store = await this.storeService.getById(Number(request.params.id))
    return reply.send(success(store))
  }

  public async updateStatus(
    request: FastifyRequest<{ Params: StoreParams; Body: UpdateStoreStatusRequest }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.storeService.updateStatus(Number(request.params.id), request.body)
    return reply.send(success(null))
  }

  public async resetPassword(
    request: FastifyRequest<{ Params: StoreParams; Body: ResetPasswordRequest }>,
    reply: FastifyReply,
  ): Promise<void> {
    await this.storeService.resetPassword(Number(request.params.id), request.body)
    return reply.send(success(null))
  }

  public registerRoutes(fastify: FastifyInstance): void {
    fastify.post('/login', this.login.bind(this))
    fastify.get('/stores/:id', this.getById.bind(this))
    fastify.patch('/stores/:id/status', this.updateStatus.bind(this))
    fastify.post('/stores/:id/reset-password', this.resetPassword.bind(this))
  }
}
