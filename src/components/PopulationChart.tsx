import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type MouseHandlerDataParam,
} from 'recharts';
import { getPrefectureColor, CHART_THEME } from '@/constants/colors';
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

  // グラフ上でホバーされている年度のデータ
  const [hoveredData, setHoveredData] = useState<Record<string, number> | null>(
    null,
  );

  // TanStack Query で選択中都道府県の人口データを取得
  const { data, isError, error } = usePopulation(selectedPrefectures);

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
      <div className="bg-white p-12 border border-slate-900 text-center text-slate-500">
        <p className="font-pixel text-xs text-slate-400 uppercase tracking-wider mb-2">
          No Prefecture Selected
        </p>
        <p className="text-sm font-medium text-slate-600">
          都道府県を選択してください
        </p>
      </div>
    );
  }

  // エラー表示
  if (isError) {
    return (
      <div className="bg-white p-8 border border-red-600 text-center text-red-600">
        <p className="font-pixel text-xs uppercase tracking-wider mb-2">
          Data Load Error
        </p>
        <p className="text-sm font-medium">
          {error?.message ?? '人口データの取得に失敗しました'}
        </p>
      </div>
    );
  }

  // グラフホバー時のデータ更新ハンドラ
  const handleChartMove = (state: MouseHandlerDataParam) => {
    if (state && state.isTooltipActive) {
      const index =
        typeof state.activeTooltipIndex === 'number'
          ? state.activeTooltipIndex
          : null;
      const year = Number(state.activeLabel);
      const dataPoint =
        (index != null ? chartData[index] : null) ??
        chartData.find((d) => d.year === year);
      if (dataPoint) {
        setHoveredData(dataPoint);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-900 flex flex-col">
      {/* カテゴリ切り替えタブ（スマホ: 2x2グリッド、タブレット: 4分割、PC: 左寄せインライン） */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex border-b border-slate-900 bg-white">
        {POPULATION_CATEGORIES.map((category, index) => {
          const isSelected = selectedCategory === category;
          const isTopRow = index < 2;
          const isLeftCol = index % 2 === 0;
          const isLast = index === POPULATION_CATEGORIES.length - 1;

          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedCategory(category)}
              className={`relative flex items-center justify-center px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer text-center ${
                isTopRow ? 'border-b border-slate-900 sm:border-b-0' : ''
              } ${
                isLeftCol
                  ? 'border-r border-slate-900'
                  : 'border-r-0 sm:border-r border-slate-900'
              } ${
                isLast ? 'sm:last:border-r-0 lg:last:border-r' : ''
              } lg:w-auto lg:px-5 ${
                isSelected
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center justify-center">
                <span
                  className={`font-pixel inline-block w-2 text-center transition-opacity ${
                    isSelected ? 'opacity-100 text-slate-900' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                >
                  [
                </span>
                <span className="px-0.5">{category}</span>
                <span
                  className={`font-pixel inline-block w-2 text-center transition-opacity ${
                    isSelected ? 'opacity-100 text-slate-900' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                >
                  ]
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* グラフ描画エリア */}
      <div
        className="w-full h-80 sm:h-96 p-0 [&_*:focus]:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none"
        onMouseLeave={() => setHoveredData(null)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 36, bottom: 12, left: 8 }}
            accessibilityLayer={false}
            onMouseMove={handleChartMove}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
            <XAxis
              dataKey="year"
              unit="年"
              tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
            />
            <YAxis
              width={72}
              tickMargin={4}
              tick={{ fill: CHART_THEME.axis, fontSize: 12 }}
              tickFormatter={(value: number) =>
                value === 0
                  ? ''
                  : `${Math.floor(value / 10000).toLocaleString()}万人`
              }
            />
            {/* ガイド線（カーソル）を表示し、吹き出しは出さない */}
            <Tooltip
              content={() => null}
              cursor={{
                stroke: CHART_THEME.cursor,
                strokeWidth: 1,
                strokeDasharray: '2 2',
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

      {/* 凡例 兼 ホバー情報バー */}
      <div
        data-testid="chart-legend"
        className="bg-slate-50 p-3.5 sm:p-5 border-t border-slate-900 min-h-[52px]"
      >
        <div className="flex items-center min-h-[24px] mb-2.5">
          {hoveredData ? (
            <span className="font-pixel text-xs font-bold px-2 py-0.5 bg-slate-900 text-white border border-slate-900 tracking-wide">
              {hoveredData.year}年（{selectedCategory}）
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 py-0.5 tracking-wider">
              グラフを選択すると各年度の数値を表示します
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 items-baseline">
          {selectedPrefectures.map((pref, index) => {
            const value = hoveredData ? hoveredData[pref.prefName] : undefined;
            return (
              <div key={pref.prefCode} className="flex items-baseline gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-none shrink-0 self-center"
                  style={{ backgroundColor: getPrefectureColor(index) }}
                />
                <span className="text-xs text-slate-700 font-medium">
                  {pref.prefName}
                </span>
                {value !== undefined && (
                  <span className="font-pixel font-bold text-slate-900 text-xs sm:text-sm ml-0.5">
                    {Math.floor(value / 10000).toLocaleString()}
                    <span className="text-[11px] font-normal text-slate-500 ml-0.5">
                      万人
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
