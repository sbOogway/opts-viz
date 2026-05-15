export function encodeToUrl(legs, underlyingPrice) {
  const params = new URLSearchParams()
  params.set('legs', JSON.stringify(legs))
  params.set('u', String(underlyingPrice))
  return params.toString()
}

export function decodeFromUrl(search) {
  const params = new URLSearchParams(search)
  const legsStr = params.get('legs')
  const uStr = params.get('u')
  if (!legsStr || !uStr) return null
  try {
    const legs = JSON.parse(legsStr)
    const underlyingPrice = Number(uStr)
    if (!Array.isArray(legs) || !legs.length) return null
    return { legs, underlyingPrice }
  } catch {
    return null
  }
}
