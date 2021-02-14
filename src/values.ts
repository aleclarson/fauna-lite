import { Class, is } from '@alloc/is'
import { $F } from './symbols'

/** @internal */
export const tagFaunaType = (cls: Class) =>
  Object.defineProperty(cls.prototype, $F, { value: cls })

export class Ref<T extends object = any> {
  constructor(
    readonly id: string,
    readonly collection?: Ref,
    readonly database?: Ref
  ) {}

  /** This enforces type nominality. */
  protected _ref!: { data: T }

  equals(ref: Ref | undefined): boolean {
    return (
      !!ref &&
      this.id == ref.id &&
      (this.collection
        ? this.collection.equals(ref.collection)
        : !ref.collection) &&
      (this.database ? this.database.equals(ref.database) : !ref.database)
    )
  }

  /**
   * Encode this ref into a string.
   *
   * Database refs are not supported.
   */
  toString() {
    const { id, collection } = this
    return collection == Ref.Native.collections ? collection.id + '/' + id : id
  }

  /**
   * Convert an encoded ref into a `Ref` instance.
   */
  static from(encodedRef: string) {
    const [scope, id] = encodedRef.split('/')
    const collection = new Ref(scope, Ref.Native.collections)
    return id ? new Ref(id, collection) : collection
  }

  static Native = {
    collections: new Ref('collections'),
    indexes: new Ref('indexes'),
    databases: new Ref('databases'),
    functions: new Ref('functions'),
    roles: new Ref('roles'),
    keys: new Ref('keys'),
    access_providers: new Ref('access_providers'),
  }
}

tagFaunaType(Ref)

export class FaunaTime {
  readonly isoTime: string

  constructor(value: string | Date) {
    if (is.date(value)) {
      value = value.toISOString()
    } else if (value.slice(-1) != 'Z') {
      throw Error(`Expected timezone "Z" but got "${value}"`)
    }
    this.isoTime = value
  }

  /** Create a `Date` object using `this.isoTime`, thereby **losing nanosecond precision.** */
  get date() {
    return new Date(this.isoTime)
  }

  /** This enforces type nominality. */
  protected _type!: 'FaunaTime'
}

tagFaunaType(FaunaTime)

export class FaunaDate {
  readonly isoDate: string

  constructor(value: string | Date) {
    if (is.date(value)) {
      // Extract the "YYYY-MM-DD" part.
      value = value.toISOString().slice(0, 10)
    }
    this.isoDate = value
  }

  get date() {
    return new Date(this.isoDate)
  }

  /** This enforces type nominality. */
  protected _type!: 'FaunaDate'
}

tagFaunaType(FaunaDate)
