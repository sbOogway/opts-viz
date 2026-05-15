export function longCallPayoff(underlyingPrice, strike, premium, quantity = 1) {
  return (Math.max(underlyingPrice - strike, 0) - premium) * quantity
}

export function longPutPayoff(underlyingPrice, strike, premium, quantity = 1) {
  return (Math.max(strike - underlyingPrice, 0) - premium) * quantity
}

export function shortCallPayoff(underlyingPrice, strike, premium, quantity = 1) {
  return -longCallPayoff(underlyingPrice, strike, premium, quantity)
}

export function shortPutPayoff(underlyingPrice, strike, premium, quantity = 1) {
  return -longPutPayoff(underlyingPrice, strike, premium, quantity)
}
