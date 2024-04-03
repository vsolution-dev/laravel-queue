import { PhpStringify } from './PhpStringify'
import { PhpParse } from './PhpParse'

export const stringify = (value: any) => {
  return new PhpStringify(value).toString();
}

export const parse = (string: string) => {
  return new PhpParse(string).readValue();
}
