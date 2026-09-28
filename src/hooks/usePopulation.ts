import { useQueries } from '@tanstack/react-query';
import { fetchPopulation } from '@/services/api';
import { Prefecture } from '@/types/prefecture';

/**
 * 選択された都道府県の人口データを取得するカスタムフック
 */
export function usePopulation(selectedPrefectures: Prefecture[]) {
  return useQueries({
    // 選択された都道府県ごとにクエリを動的に作成
    queries: selectedPrefectures.map((pref) => ({
      queryKey: ['population', pref.prefCode],
      queryFn: () => fetchPopulation(pref.prefCode),
    })),
    // 複数の結果をまとめて扱いやすいオブジェクトにする
    combine: (results) => {
      return {
        data: results.map((result, index) => ({
          pref: selectedPrefectures[index],
          population: result.data,
        })),
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
        error: results.find((result) => result.error)?.error ?? null,
      };
    },
  });
}
