import { Ref, FaunaTime, FaunaDate } from './values'
import { $F } from './symbols'

/** @internal */
export const toFaunaType = (val: any) => val && val[$F]

export const FaunaJSON = {
  parse: (json: string) => JSON.parse(json, FaunaJSON.parser),
  stringify: (data: any) => JSON.stringify(data, FaunaJSON.replacer),

  /** @internal */
  parser: faunaParser,
  /** @internal */
  replacer: faunaReplacer,
}

const refKey = '@ref'
const timeKey = '@ts'
const dateKey = '@date'

type NativeRef = keyof typeof Ref['Native']

function parseRef(value: any): Ref {
  const { id, collection, database } = value[refKey]
  return collection || database
    ? new Ref(
        id,
        collection && parseRef(collection),
        database && parseRef(database)
      )
    : Ref.Native[id as NativeRef] || new Ref(id)
}

function faunaParser(_key: string, value: any) {
  if (value && typeof value == 'object') {
    if (value[refKey]) {
      value = parseRef(value)
    } else if (value[timeKey]) {
      value = new FaunaTime(value[timeKey])
    } else if (value[dateKey]) {
      value = new FaunaDate(value[dateKey])
    }
  }
  return value
}

function faunaReplacer(_key: string, value: any) {
  switch (toFaunaType(value)) {
    case Ref:
      return { [refKey]: { ...value } }
    case FaunaTime:
      return { [timeKey]: value.isoTime }
    case FaunaDate:
      return { [dateKey]: value.isoDate }
  }
  return value
}
