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
          {error?.message ?? '都道府県一覧の取得に失敗しました。'}
        </p>
      </div>
    );
  }

  // 都道府県チェックボックス一覧表示
  return (
    <fieldset className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200">
      <legend className="text-base font-bold text-slate-900 mb-3">
        都道府県
      </legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {prefectures.map((pref) => {
          const isChecked = selectedPrefectures.some(
            (p) => p.prefCode === pref.prefCode,
          );
          return (
            <label
              key={pref.prefCode}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:text-slate-900 select-none"
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
    </fieldset>
  );
}
