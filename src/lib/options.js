export function longCallPayoff(underlyingPrice, strike, premium) {
  return Math.max(underlyingPrice - strike, 0) - premium
}

export function longPutPayoff(underlyingPrice, strike, premium) {
  return Math.max(strike - underlyingPrice, 0) - premium
}

export function shortCallPayoff(underlyingPrice, strike, premium) {
  return -longCallPayoff(underlyingPrice, strike, premium)
}

export function shortPutPayoff(underlyingPrice, strike, premium) {
  return -longPutPayoff(underlyingPrice, strike, premium)
}
