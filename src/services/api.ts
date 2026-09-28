import { Prefecture, PrefecturesApiResponse } from '@/types/prefecture';
import {
  PopulationApiResponse,
  PopulationCompositionResult,
} from '@/types/population';

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

/**
 * 指定した都道府県の人口データを取得する
 * @param prefCode 都道府県コード
 */
export async function fetchPopulation(
  prefCode: number,
): Promise<PopulationCompositionResult> {
  const response = await fetch(
    `/api/v1/population/composition/perYear?prefCode=${prefCode}`,
    {
      headers: {
        'X-API-KEY': API_KEY,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `人口データの取得に失敗しました (ステータス: ${response.status})`,
    );
  }

  const data: PopulationApiResponse = await response.json();
  return data.result;
}
