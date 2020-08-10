import { Ref, FaunaTime, FaunaDate } from './values'
import { $F } from './symbols'

export const FaunaJSON = {
  parse: (json: string) => JSON.parse(json, faunaParser),
  stringify: (data: any) => JSON.stringify(data, faunaReplacer),
}

const refKey = '@ref'
const timeKey = '@ts'
const dateKey = '@date'

function parseRef(value: any): Ref {
  const { id, collection, database } = value[refKey]
  return collection || database
    ? new Ref(
        id,
        collection && parseRef(collection),
        database && parseRef(database)
      )
    : Ref.Native[id] || new Ref(id)
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
  switch (value && value[$F]) {
    case Ref:
      return { '@ref': { ...value } }
    case FaunaTime:
      return { '@ts': value.isoTime }
    case FaunaDate:
      return { '@date': value.isoDate }
  }
  return value
}
