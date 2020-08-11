import { Class, is } from '@alloc/is'
import { $F } from './symbols'

/** @internal */
export const tagFaunaType = (cls: Class) =>
  Object.defineProperty(cls.prototype, $F, { value: cls })

export class Ref {
  constructor(
    readonly id: string,
    readonly collection?: Ref,
    readonly database?: Ref
  ) {}

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

  static Native: { [key: string]: Ref } = {
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
}

tagFaunaType(FaunaDate)
