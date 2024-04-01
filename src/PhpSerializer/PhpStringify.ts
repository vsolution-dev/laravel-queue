export class PhpStringify {

  private string: string = '';

  constructor(value:any) {
    this.writeValue(value);
  }

  append(string: string) {
    this.string += string;
  }

  writeValue(value: any) {
    const type = typeof value;

    if (value === null || type === 'undefined') {
      this.writeNull();
      return;
    }

    if (type === 'string') {
      this.writeString(value);
      return;
    }

    if (type === 'number') {
      if (parseInt(value.toString(), 10) === value) {
        this.writeInt(value);
        return;
      }

      this.writeDouble(value);
      return;
    }

    if (type === 'boolean') {
      this.writeBoolean(value);
      return;
    }

    if (type !== 'object') {
      throw new Error(`Unknown type: ${type}`);
    }

    if (value['___PHP_CLASS___']) {
      this.writeObject(value);
      return;
    }

    this.writeArray(value);
  }

  writeArrayOrObject(value: any) {
    const entries = Array.isArray(value)
      ? Array.from(value.entries())
      : Object.entries(value)

    this.append(`${entries.length}:`);
    this.append(`{`);

    entries.forEach(([ key, value ]:any) => {
      this.writeValue(key);
      this.writeValue(value);
    });

    this.append(`}`);
  }

  writeArray(value: any) {
    this.append(`a:`)
    this.writeArrayOrObject(value);
  }

  writeObject({ ___PHP_CLASS___, ...value }:{
    ___PHP_CLASS___:string
  }) {
    this.append(`O:`)
    this.append(`${___PHP_CLASS___.length}:"${___PHP_CLASS___}":`)
    this.writeArrayOrObject(value);
  }

  writeString(value: string) {
    const length = Buffer.byteLength(value, 'utf8');
    this.append(`s:`);
    this.append(`${length}:`);
    this.append(`"${value}";`);
  }

  writeInt(value: number) {
    this.append(`i:`);
    this.append(`${value};`);
  }

  writeBoolean(value: boolean) {
    this.append(`b:`);
    this.append(`${value ? '1' : '0'};`);
  }

  writeDouble(value: number) {
    this.append(`d:`);
    this.append(`${value.toString().toUpperCase()};`);
  }

  writeNull() {
    this.append('N;');
  }

  toString() {
    return this.string;
  }
}
