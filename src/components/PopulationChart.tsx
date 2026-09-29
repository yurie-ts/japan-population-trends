import { useState, useMemo, ReactNode } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from 'recharts';
import { getPrefectureColor } from '@/constants/colors';
import { usePopulation } from '@/hooks/usePopulation';
import { Prefecture } from '@/types/prefecture';
import { PopulationCategory, POPULATION_CATEGORIES } from '@/types/population';

/**
 * 人口推移グラフコンポーネントの Props 定義
 */
interface PopulationChartProps {
  /** 選択中の都道府県一覧 */
  selectedPrefectures: Prefecture[];
}

/**
 * 選択された都道府県の人口推移グラフとカテゴリ切り替えを表示するコンポーネント
 */
export default function PopulationChart({
  selectedPrefectures,
}: PopulationChartProps) {
  // 現在選択中の人口カテゴリ（初期値: 総人口）
  const [selectedCategory, setSelectedCategory] =
    useState<PopulationCategory>('総人口');

  // TanStack Query で選択中都道府県の人口データを取得
  const { data, isLoading, isError, error } =
    usePopulation(selectedPrefectures);

  // Recharts 用のデータ形式に整形する
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 年ごとに各都道府県の人口をまとめる
    // 整形後のデータ形式例:
    // [
    //   { year: 1960, "北海道": 5039206, "東京都": 9683802 },
    //   { year: 1965, "北海道": 5171800, "東京都": 10869244 },
    //   ...
    // ]
    const map = new Map<number, Record<string, number>>();

    data.forEach(({ pref, population }) => {
      if (!population) return;
      // 選択中のカテゴリのデータを取り出す
      const categoryData = population.data.find(
        (c) => c.label === selectedCategory,
      );
      if (!categoryData) return;

      categoryData.data.forEach((point) => {
        if (!map.has(point.year)) {
          map.set(point.year, { year: point.year });
        }
        const record = map.get(point.year)!;
        record[pref.prefName] = point.value;
      });
    });

    // 年の昇順に並べ替えて配列で返す
    return Array.from(map.values()).sort((a, b) => a.year - b.year);
  }, [data, selectedCategory]);

  // 都道府県の未選択表示
  if (selectedPrefectures.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
        <p>都道府県を選択してください</p>
      </div>
    );
  }

  // エラー表示
  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center text-red-600">
        <p>{error?.message ?? '人口データの取得に失敗しました'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 space-y-6">
      {/* カテゴリ切り替えタブ */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {POPULATION_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <p className="text-sm text-slate-500 text-center py-2">
          人口データを読み込み中...
        </p>
      )}

      {/* グラフ描画エリア */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" unit="年" />
            <YAxis
              tickFormatter={(value: number) =>
                value === 0
                  ? ''
                  : `${Math.floor(value / 10000).toLocaleString()}万人`
              }
            />
            <Tooltip
              labelFormatter={(label: ReactNode) => `${label}年`}
              formatter={(value) =>
                typeof value === 'number'
                  ? `${Math.floor(value / 10000).toLocaleString()}万人`
                  : value
              }
              itemSorter={(item) => {
                const pref = selectedPrefectures.find(
                  (p) => p.prefName === item.name,
                );
                return pref ? pref.prefCode : 0;
              }}
            />
            <Legend
              itemSorter={(item) => {
                const pref = selectedPrefectures.find(
                  (p) => p.prefName === item.value,
                );
                return pref ? pref.prefCode : 0;
              }}
            />
            {selectedPrefectures.map((pref, index) => (
              <Line
                key={pref.prefCode}
                type="monotone"
                dataKey={pref.prefName}
                stroke={getPrefectureColor(index)}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
