import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';

export const SUBSCRIPTION_PLANS_KEY = ['subscription', 'plans'];

export function usePlans(enabled = true) {
  return useQuery({
    queryKey: SUBSCRIPTION_PLANS_KEY,
    queryFn: async () => {
      const res = await API.get('/subscriptions/plans');
      return res.data || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (v5 uses gcTime instead of cacheTime)
  });
}

export default usePlans;