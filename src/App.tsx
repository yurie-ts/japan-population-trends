import { useState } from 'react';
import PrefectureSelector from '@/components/PrefectureSelector';
import { Prefecture } from '@/types/prefecture';

export default function App() {
  // 選択された都道府県のリスト
  const [selectedPrefectures, setSelectedPrefectures] = useState<Prefecture[]>(
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            都道府県別 人口推移グラフ
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* 都道府県選択エリア */}
        <section aria-label="都道府県選択">
          <PrefectureSelector
            selectedPrefectures={selectedPrefectures}
            onSelectionChange={setSelectedPrefectures}
          />
        </section>

        {/* グラフ表示エリア（次のステップで実装） */}
        <section className="bg-white p-6 rounded-lg border border-slate-200 text-center text-slate-500">
          {selectedPrefectures.length === 0 ? (
            <p>都道府県を選択してください</p>
          ) : (
            <p className="text-slate-800">
              選択中:{' '}
              <span className="font-semibold">
                {selectedPrefectures.map((p) => p.prefName).join('、')}
              </span>
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
