import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';

const NOTIFICATIONS_KEY = ['notifications'];

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const res = await API.get('/shoppayments/notifications');
      return res.data || [];
    },
    enabled,
    staleTime: 1000 * 20, // 20s
    gcTime: 1000 * 60 * 5, // 5 minutes (cacheTime -> gcTime in v5)
    refetchInterval: 1000 * 30, // poll every 30s
  });
}

export default useNotifications;