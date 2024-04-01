export class PhpParse {

  constructor(
    private readonly string: string,
    private offset: number = 0,
  ) {
  }

  skip(amount: number = 1): void {
    this.offset += amount;
  }

  readCharacter(): string {
    return this.string.slice(this.offset, this.offset + 1);
  }

  readUntilAsInteger(character: string): number {
    return parseInt(this.readUntil(character), 10);
  }

  readUntilAsFloat(character: string): number {
    return parseFloat(this.readUntil(character));
  }

  readUntil(character: string) {
    let index = 2;
    const buffer = [];
    let value = this.readCharacter();
    while (value !== character) {
      if (this.offset + index > this.string.length) {
        throw new Error();
      }
      buffer.push(value);
      value = this.string.slice(this.offset + index - 1, this.offset + index);
      index += 1;
    }
    this.skip(buffer.length + 1);
    return buffer.join('');
  }

  readString(): string {
    this.readUntilAsInteger(':'); // 길이

    this.skip(); // "
    let string = this.readUntil('"');
    this.skip(); // ;

    return string;
  }

  readArray() {
    const length = this.readUntilAsInteger(':'); // 개수
    this.skip(); // {

    const object:any = {};
    let isArray = true;
    for (let index = 0; index < length; index++) {
      const key = this.readValue();
      const value = this.readValue();

      if (key !== index) {
        isArray = false;
      }
      object[key] = value;
    }

    this.skip(); // }
    return isArray
      ? Object.values(object)
      : object;
  }

  readObject() {
    this.readUntil(':'); // 클래스명 길이
    this.readUntil(':'); // 클래스명
    const length = this.readUntilAsInteger(':'); // 개수
    this.skip(); // {

    const object:any = {};
    for (let index = 0; index < length; index++) {
      const key = this.readValue();
      const value = this.readValue();

      object[key] = value;
    }

    this.skip(); // }
    return object;
  }

  readValue() {
    const type = this.readCharacter();

    this.skip(2);

    switch (type.toLowerCase()) {
      case 'i':
        return this.readUntilAsInteger(';');
      case 'b':
        return this.readUntilAsInteger(';') !== 0;
      case 'd':
        return this.readUntilAsFloat(';');
      case 'n':
        return null;
      case 's':
        return this.readString();
      case 'o':
        return this.readObject();
      case 'a':
        return this.readArray();
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
}
