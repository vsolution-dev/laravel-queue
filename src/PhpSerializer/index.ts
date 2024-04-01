import { PhpStringify } from './PhpStringify'
import { PhpParse } from './PhpParse'

export function stringify(value: any) {
  return new PhpStringify(value).toString();
}

export function parse(string: string) {
  return new PhpParse(string).readValue();
}
