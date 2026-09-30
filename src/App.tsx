import { useState } from 'react';
import PrefectureSelector from '@/components/PrefectureSelector';
import { Prefecture } from '@/types/prefecture';
import PopulationChart from '@/components/PopulationChart';

export default function App() {
  // 選択された都道府県のリスト
  const [selectedPrefectures, setSelectedPrefectures] = useState<Prefecture[]>(
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-slate-900 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8 flex items-center">
          <h1 className="font-pixel text-lg sm:text-2xl font-bold tracking-wider text-slate-900 uppercase leading-none translate-y-[2px] sm:translate-y-[1px]">
            Japan Population Trends
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-1 w-full">
        {/* 都道府県選択エリア */}
        <section aria-label="都道府県選択">
          <PrefectureSelector
            selectedPrefectures={selectedPrefectures}
            onSelectionChange={setSelectedPrefectures}
          />
        </section>

        {/* グラフ表示エリア */}
        <section aria-label="人口推移グラフ">
          <PopulationChart selectedPrefectures={selectedPrefectures} />
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-900 bg-white py-6 text-center text-slate-400">
        <p className="font-pixel text-[10px] sm:text-[11px] tracking-widest uppercase">
          DATA: PROCESSED FROM RESAS (REGIONAL ECONOMY SOCIETY ANALYZING SYSTEM)
        </p>
      </footer>
    </div>
  );
}
