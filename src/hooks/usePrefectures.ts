import { useQuery } from '@tanstack/react-query';
import { fetchPrefectures } from '@/services/api';

/**
 * 都道府県一覧を取得するカスタムフック
 */
export function usePrefectures() {
  return useQuery({
    queryKey: ['prefectures'],
    queryFn: fetchPrefectures,
  });
}
