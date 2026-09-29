import { REGIONS } from '@/constants/regions';
import { usePrefectures } from '@/hooks/usePrefectures';
import { Prefecture } from '@/types/prefecture';

/**
 * 都道府県選択コンポーネントの Props 定義
 */
interface PrefectureSelectorProps {
  /** 選択中の都道府県一覧 */
  selectedPrefectures: Prefecture[];
  /** 選択中の都道府県が変更されたときのコールバック */
  onSelectionChange: (selectedPrefectures: Prefecture[]) => void;
}

/**
 * APIから都道府県一覧を取得し、チェックボックス一覧として表示するコンポーネント
 */
export default function PrefectureSelector({
  selectedPrefectures,
  onSelectionChange,
}: PrefectureSelectorProps) {
  // TanStack Queryで都道府県データを取得
  const { data: prefectures, isLoading, error } = usePrefectures();

  // チェックボックスがクリックされた時の追加/削除の処理
  const handleCheckboxChange = (pref: Prefecture) => {
    const isAlreadySelected = selectedPrefectures.some(
      (p) => p.prefCode === pref.prefCode,
    );
    // 選択済みの場合は削除
    if (isAlreadySelected) {
      onSelectionChange(
        selectedPrefectures.filter((p) => p.prefCode !== pref.prefCode),
      );
      // 未選択の場合は追加
    } else {
      onSelectionChange(
        [...selectedPrefectures, pref].sort((a, b) => a.prefCode - b.prefCode),
      );
    }
  };

  // チェックボックスの全選択解除
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // 地方単位の一括選択 / 解除
  const handleRegionToggle = (regionPrefectures: Prefecture[]) => {
    const isAllSelected = regionPrefectures.every((p) =>
      selectedPrefectures.some((sp) => sp.prefCode === p.prefCode),
    );

    if (isAllSelected) {
      // その地方の県をすべて除外
      const regionCodes = new Set(regionPrefectures.map((p) => p.prefCode));
      onSelectionChange(
        selectedPrefectures.filter((p) => !regionCodes.has(p.prefCode)),
      );
    } else {
      // その地方で未選択の県を追加
      const currentCodes = new Set(selectedPrefectures.map((p) => p.prefCode));
      const toAdd = regionPrefectures.filter(
        (p) => !currentCodes.has(p.prefCode),
      );
      onSelectionChange(
        [...selectedPrefectures, ...toAdd].sort(
          (a, b) => a.prefCode - b.prefCode,
        ),
      );
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 bg-white border border-slate-900">
        <p className="font-pixel text-xs text-slate-500 uppercase tracking-wider mb-1">
          Loading Data...
        </p>
        <p className="text-sm text-slate-700">都道府県一覧を読み込み中...</p>
      </div>
    );
  }

  // エラー表示
  if (error || !prefectures) {
    return (
      <div className="p-4 sm:p-6 bg-white border border-red-600">
        <p className="font-pixel text-xs text-red-600 uppercase tracking-wider mb-1">
          Error
        </p>
        <p className="text-sm text-red-600">
          {error?.message ?? '都道府県一覧の取得に失敗しました'}
        </p>
      </div>
    );
  }

  // 都道府県チェックボックス一覧表示（地方ごとにグループ化）
  return (
    <fieldset className="bg-white border border-slate-900">
      <details className="group" open>
        <summary className="flex items-center justify-between cursor-pointer list-none select-none p-3.5 sm:px-5 sm:py-3.5 group-open:border-b border-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span className="font-pixel text-sm sm:text-base tracking-wider uppercase">
              Filter
            </span>
            <svg
              className="w-4 h-4 text-slate-600 transition-transform duration-200 group-open:rotate-180 ml-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            {selectedPrefectures.length > 0 && (
              <span className="text-xs text-slate-500 font-medium select-none">
                {selectedPrefectures.length}件選択中
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              disabled={selectedPrefectures.length === 0}
              className="font-pixel text-xs px-3 py-1 border border-slate-900 bg-white hover:bg-slate-900 hover:text-white text-slate-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer transition-colors"
            >
              すべて解除
            </button>
          </div>
        </summary>

        {/* 地方ごとのグループ */}
        <div className="p-4 sm:p-5 space-y-4">
          {REGIONS.map((region) => {
            // その地方に属する都道府県を抽出
            const regionPrefectures = prefectures.filter((p) =>
              region.prefNames.includes(p.prefName),
            );

            if (regionPrefectures.length === 0) return null;

            // その地方の都道府県がすべて選択されているか判定
            const isAllSelected = regionPrefectures.every((p) =>
              selectedPrefectures.some((sp) => sp.prefCode === p.prefCode),
            );

            return (
              <div
                key={region.regionName}
                className="border-t border-slate-200 pt-3.5 first:border-0 first:pt-0"
              >
                <div className="mb-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-900 hover:text-black">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() => handleRegionToggle(regionPrefectures)}
                      className="w-3.5 h-3.5 rounded-none border border-slate-900 accent-slate-900 cursor-pointer"
                    />
                    <span>{region.regionName}</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 sm:gap-1.5">
                  {regionPrefectures.map((pref) => {
                    const isChecked = selectedPrefectures.some(
                      (p) => p.prefCode === pref.prefCode,
                    );
                    return (
                      <label
                        key={pref.prefCode}
                        className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm text-slate-800 hover:text-black select-none py-0.5 px-1 hover:bg-slate-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(pref)}
                          className="w-3.5 h-3.5 rounded-none border border-slate-900 accent-slate-900 cursor-pointer"
                        />
                        <span className="truncate">{pref.prefName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </details>
    </fieldset>
  );
}
