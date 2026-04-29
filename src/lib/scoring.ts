// Rule-based lead scoring
export function calculateScore(budget: number): 'High' | 'Medium' | 'Low' {
  if (budget > 20) return 'High'
  if (budget >= 10) return 'Medium'
  return 'Low'
}
