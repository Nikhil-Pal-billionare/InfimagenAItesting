export type PlanId = "starter" | "pro" | "elite";
export const PLAN_CREDITS: Record<PlanId, number> = {
  starter: 1400,
  pro:     5000,
  elite:   10000,
};
