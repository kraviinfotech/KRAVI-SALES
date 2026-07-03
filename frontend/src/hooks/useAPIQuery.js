import { useQuery } from '@tanstack/react-query';
import API from '../api/axios';

/**
 * Generic helper to fetch a GET endpoint via axios and cache with react-query.
 * Usage:
 * const { data, isLoading, error } = useAPIQuery(
 *   ['users'],
 *   '/users',
 *   { staleTime: 60000 }
 * );
 */
function useAPIQuery(key, url, options = {}) {
  return useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => {
      const res = await API.get(url, { signal });
      return res.data;
    },
    staleTime: 1000 * 60, // default 1 minute
    gcTime: 1000 * 60 * 30, // 30 minutes (v5 replaces cacheTime with gcTime)
    ...options,
  });
}

export default useAPIQuery;