export const VATRATE: number = 0.19

export const net2Gross = (raw: string): number => {
  const netPrice: number = Number(raw)
  const grossPrice: number = Number((netPrice * (1 + VATRATE)).toFixed(2))
  return grossPrice
}
