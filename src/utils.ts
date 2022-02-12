export function chunk(array: any[], n: number) {
  return array.reduce((acc, val, i) => {
    if (i % n === 0) {
      acc.push([val])
    } else {
      acc[acc.length - 1].push(val)
    }
    return acc
  }, [])
}

export function zipObject(keys: any[], values: any[]) {
  return keys.reduce((acc, key, i) => {
    acc[key] = values[i]
    return acc
  }, {})
}
