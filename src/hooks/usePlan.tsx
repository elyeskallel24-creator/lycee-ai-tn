import { useAuth } from './useAuth';
import { Plan, planAllows } from '@/lib/constants';

export const usePlan = () => {
  const { profile } = useAuth();
  const plan: Plan = profile?.plan ?? 'freemium';
  return {
    plan,
    isFreemium: plan === 'freemium',
    isLite: plan === 'lite',
    isPremium: plan === 'premium',
    can: (toolPlan: Plan) => planAllows(plan, toolPlan),
  };
};
