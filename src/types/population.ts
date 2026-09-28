/**
 * 人口構成カテゴリの種類
 */
export type PopulationCategory =
  '総人口' | '年少人口' | '生産年齢人口' | '老年人口';

/**
 * 人口構成カテゴリの一覧
 */
export const POPULATION_CATEGORIES: PopulationCategory[] = [
  '総人口',
  '年少人口',
  '生産年齢人口',
  '老年人口',
];

/**
 * 1年あたりの人口データ
 */
export interface PopulationDataPoint {
  year: number; // 年 (例: 1960)
  value: number; // 人口数 (例: 5039206)
}

/**
 * カテゴリごとの人口データ一覧
 */
export interface PopulationCategoryData {
  label: PopulationCategory;
  data: PopulationDataPoint[];
}

/**
 * 人口構成APIの result オブジェクト
 */
export interface PopulationCompositionResult {
  boundaryYear: number; // 実績値と推計値の境目の年
  data: PopulationCategoryData[];
}

/**
 * 人口構成APIのレスポンス全体
 */
export interface PopulationApiResponse {
  message: string | null;
  result: PopulationCompositionResult;
}
