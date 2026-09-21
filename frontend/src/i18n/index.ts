import { pt } from './pt'

const dict = pt

export function t(key: string, vars?: Record<string, string | number>): string {
  let text = key
  let node: unknown = dict
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part]
    } else {
      node = undefined
      break
    }
  }
  if (typeof node === 'string') text = node
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.split(`{${k}}`).join(String(v))
    }
  }
  return text
}