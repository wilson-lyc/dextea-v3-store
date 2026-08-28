import { apiRoutes } from '@dextea/constraints'

export interface PublicRouteRule {
  readonly method: string | '*'
  readonly path: string | RegExp
}

export const publicRoutes: readonly PublicRouteRule[] = [
  { method: 'POST', path: apiRoutes.auth.login() },
  { method: '*', path: '/health' },
  { method: '*', path: /^\/docs(\/|$)/ },
]

function pathMatches(rule: PublicRouteRule, path: string): boolean {
  return typeof rule.path === 'string' ? rule.path === path : rule.path.test(path)
}

export function isPublicRequest(
  method: string,
  path: string,
  rules: readonly PublicRouteRule[] = publicRoutes,
): boolean {
  return rules.some(
    (rule) => (rule.method === '*' || rule.method === method) && pathMatches(rule, path),
  )
}
