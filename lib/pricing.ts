export type PlanId = "starter" | "pro" | "elite";
export const PRICING = {
  INR: { currency: "INR", symbol: "₹", plans: {
    starter: { original: 1149, discounted: 999 },
    pro:     { original: 1999, discounted: 1699 },
    elite:   { original: 3999, discounted: 3499 },
  }},
  USD: { currency: "USD", symbol: "$", plans: {
    starter: { original: 13, discounted: 11 },
    pro:     { original: 23, discounted: 19 },
    elite:   { original: 45, discounted: 39 },
  }},
};
