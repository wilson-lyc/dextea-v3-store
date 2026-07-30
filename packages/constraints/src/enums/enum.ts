import { z } from 'zod'

export type EnumDef<C extends number> = readonly (readonly [code: C, key: string, label: string])[]

export interface EnumMember<C extends number> {
  readonly code: C
  readonly key: string
  readonly label: string
}

function unionOfCodes<C extends number>(defs: EnumDef<C>): z.ZodType<C> {
  const literals = defs.map(([code]) => z.literal(code)) as unknown as [z.ZodType<C>, ...z.ZodType<C>[]]
  return literals.length === 1 ? literals[0] : z.union(literals)
}

export class Enum<C extends number = number> {
  readonly name: string
  readonly members: EnumMember<C>[]
  readonly zod: z.ZodType<C>
  private readonly codeMap = new Map<C, EnumMember<C>>()
  private readonly keyMap = new Map<string, EnumMember<C>>()

  constructor(name: string, defs: EnumDef<C>) {
    this.name = name
    this.members = defs.map(([code, key, label]) => ({ code, key, label }))
    this.zod = unionOfCodes(defs)
    for (const member of this.members) {
      this.codeMap.set(member.code, member)
      this.keyMap.set(member.key, member)
    }
  }

  byCode(code: C): EnumMember<C> | undefined {
    return this.codeMap.get(code)
  }

  byKey(key: string): EnumMember<C> | undefined {
    return this.keyMap.get(key)
  }

  label(code: C): string | undefined {
    return this.codeMap.get(code)?.label
  }

  key(code: C): string | undefined {
    return this.codeMap.get(code)?.key
  }

  has(code: C): boolean {
    return this.codeMap.has(code)
  }

  codes(): C[] {
    return this.members.map((member) => member.code)
  }
}
