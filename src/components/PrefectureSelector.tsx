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
    if (isAlreadySelected) {
      // すでに選択済みなら除外して親に通知
      onSelectionChange(
        selectedPrefectures.filter((p) => p.prefCode !== pref.prefCode),
      );
    } else {
      // 未選択なら追加して親に通知
      onSelectionChange([...selectedPrefectures, pref]);
    }
  };

  // チェックボックスの全選択解除
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200">
        <p className="text-sm text-slate-500">都道府県一覧を読み込み中...</p>
      </div>
    );
  }

  // エラー表示
  if (error || !prefectures) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-600">
          {error?.message ?? '都道府県一覧の取得に失敗しました'}
        </p>
      </div>
    );
  }

  // 都道府県チェックボックス一覧表示（地方ごとにグループ化）
  return (
    <fieldset className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
      <details className="group" open>
        <summary className="flex items-center justify-between cursor-pointer list-none select-none mb-4 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span>フィルター</span>
            <svg
              className="w-4 h-4 text-slate-500 transition-transform duration-200 group-open:rotate-180"
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            disabled={selectedPrefectures.length === 0}
            className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            すべて解除
          </button>
        </summary>

        <div className="space-y-4">
          {REGIONS.map((region) => {
            // その地方に属する都道府県を抽出
            const regionPrefectures = prefectures.filter((p) =>
              region.prefNames.includes(p.prefName),
            );

            if (regionPrefectures.length === 0) return null;

            return (
              <div
                key={region.regionName}
                className="border-t border-slate-100 pt-3 first:border-0 first:pt-0"
              >
                <h3 className="text-xs font-semibold text-slate-500 mb-2">
                  {region.regionName}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
                  {regionPrefectures.map((pref) => {
                    const isChecked = selectedPrefectures.some(
                      (p) => p.prefCode === pref.prefCode,
                    );
                    return (
                      <label
                        key={pref.prefCode}
                        className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900 select-none py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(pref)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{pref.prefName}</span>
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
