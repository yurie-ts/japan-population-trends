import { Prefecture, PrefecturesApiResponse } from '@/types/prefecture';

const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * 都道府県一覧を取得する
 */
export async function fetchPrefectures(): Promise<Prefecture[]> {
  const response = await fetch('/api/v1/prefectures', {
    headers: {
      'X-API-KEY': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `都道府県の取得に失敗しました (ステータス: ${response.status})`,
    );
  }

  const data: PrefecturesApiResponse = await response.json();
  return data.result;
}
