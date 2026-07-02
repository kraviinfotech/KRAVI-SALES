import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';

export const SUBSCRIPTION_STATUS_KEY = ['subscription', 'status'];

export function useSubscriptionStatus(enabled = true) {
  return useQuery({
    queryKey: SUBSCRIPTION_STATUS_KEY,
    queryFn: async () => {
      const res = await API.get('/subscriptions/my-status');
      return res.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  });
}

export default useSubscriptionStatus;