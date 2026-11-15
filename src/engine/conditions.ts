// Tiny evaluator for the condition strings in game-rules.json, e.g.
//   "always"
//   "purpose == 'tourism' AND stayDays > country.visaExemptTourismDays"
//   "purpose in ['study','work']"
//   "route.transit is in yellowFeverTransitCountries"
//
// Grammar:
//   expr       := and ("OR" and)*
//   and        := comparison ("AND" comparison)*
//   comparison := value (op value)?
//   op         := == | != | > | >= | < | <= | in | is in
//   value      := 'string' | number | true | false | always | [value, ...] | path
//   path       := identifier(.identifier)*   — looked up in the context
//
// `in` against a list of objects compares with each object's `code`, so a
// country code (or a { code } object) can be checked against a country list.

export type ConditionContext = Record<string, unknown>

type Node =
  | { kind: 'literal'; value: unknown }
  | { kind: 'path'; path: string[] }
  | { kind: 'list'; items: Node[] }
  | { kind: 'binary'; op: string; left: Node; right: Node }

const TOKEN = /\s*(>=|<=|==|!=|>|<|\[|\]|,|'[^']*'|\d+(?:\.\d+)?|[A-Za-z_][\w.]*)/y

function tokenize(source: string): string[] {
  const tokens: string[] = []
  TOKEN.lastIndex = 0
  let match: RegExpExecArray | null
  while (TOKEN.lastIndex < source.length && (match = TOKEN.exec(source))) tokens.push(match[1])
  if (source.slice(TOKEN.lastIndex).trim() !== '') {
    throw new Error(`Cannot parse condition "${source}" near "${source.slice(TOKEN.lastIndex)}"`)
  }
  return tokens
}

function parse(source: string): Node {
  const tokens = tokenize(source)
  let i = 0
  const peek = () => tokens[i]
  const next = () => {
    const t = tokens[i++]
    if (t === undefined) throw new Error(`Unexpected end of condition "${source}"`)
    return t
  }

  function value(): Node {
    const t = next()
    if (t === '[') {
      const items: Node[] = []
      if (peek() !== ']') {
        do items.push(value())
        while (peek() === ',' && next())
      }
      if (next() !== ']') throw new Error(`Expected "]" in condition "${source}"`)
      return { kind: 'list', items }
    }
    if (t.startsWith("'")) return { kind: 'literal', value: t.slice(1, -1) }
    if (/^\d/.test(t)) return { kind: 'literal', value: Number(t) }
    if (t === 'true' || t === 'always') return { kind: 'literal', value: true }
    if (t === 'false') return { kind: 'literal', value: false }
    return { kind: 'path', path: t.split('.') }
  }

  function comparison(): Node {
    const left = value()
    const t = peek()
    if (t === 'is') {
      next()
      if (next() !== 'in') throw new Error(`Expected "is in" in condition "${source}"`)
      return { kind: 'binary', op: 'in', left, right: value() }
    }
    if (t && ['==', '!=', '>', '>=', '<', '<=', 'in'].includes(t)) {
      next()
      return { kind: 'binary', op: t, left, right: value() }
    }
    return left
  }

  function and(): Node {
    let node = comparison()
    while (peek() === 'AND') {
      next()
      node = { kind: 'binary', op: 'AND', left: node, right: comparison() }
    }
    return node
  }

  function or(): Node {
    let node = and()
    while (peek() === 'OR') {
      next()
      node = { kind: 'binary', op: 'OR', left: node, right: and() }
    }
    return node
  }

  const node = or()
  if (i !== tokens.length) throw new Error(`Unexpected "${tokens[i]}" in condition "${source}"`)
  return node
}

function codeOf(v: unknown): unknown {
  return v !== null && typeof v === 'object' && 'code' in v ? (v as { code: unknown }).code : v
}

function evaluateNode(node: Node, ctx: ConditionContext, source: string): unknown {
  switch (node.kind) {
    case 'literal':
      return node.value
    case 'list':
      return node.items.map((n) => evaluateNode(n, ctx, source))
    case 'path': {
      const [head, ...rest] = node.path
      if (!(head in ctx)) throw new Error(`Unknown identifier "${head}" in condition "${source}"`)
      let v: unknown = ctx[head]
      for (const key of rest) v = v == null ? undefined : (v as Record<string, unknown>)[key]
      return v
    }
    case 'binary': {
      if (node.op === 'AND') return Boolean(evaluateNode(node.left, ctx, source)) && Boolean(evaluateNode(node.right, ctx, source))
      if (node.op === 'OR') return Boolean(evaluateNode(node.left, ctx, source)) || Boolean(evaluateNode(node.right, ctx, source))
      const l = evaluateNode(node.left, ctx, source)
      const r = evaluateNode(node.right, ctx, source)
      switch (node.op) {
        case '==': return l === r
        case '!=': return l !== r
        case '>': return (l as number) > (r as number)
        case '>=': return (l as number) >= (r as number)
        case '<': return (l as number) < (r as number)
        case '<=': return (l as number) <= (r as number)
        case 'in': {
          if (!Array.isArray(r)) throw new Error(`Right side of "in" is not a list in condition "${source}"`)
          const needle = codeOf(l)
          return needle != null && r.some((item) => codeOf(item) === needle)
        }
      }
    }
  }
  throw new Error(`Cannot evaluate condition "${source}"`)
}

const cache = new Map<string, Node>()

/** Parses (once, cached) and evaluates a condition string against `ctx`. */
export function evaluateCondition(source: string, ctx: ConditionContext): boolean {
  let node = cache.get(source)
  if (!node) {
    node = parse(source)
    cache.set(source, node)
  }
  return Boolean(evaluateNode(node, ctx, source))
}

/** Throws if the condition string is not valid syntax. */
export function assertConditionParses(source: string): void {
  if (!cache.has(source)) cache.set(source, parse(source))
}
