import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PopulationChart from './PopulationChart';
import * as hooks from '@/hooks/usePopulation';
import { Prefecture } from '@/types/prefecture';

// JSDOM環境でRechartsのSVG描画がスキップされないようにモック
vi.mock('recharts', async () => {
  const original = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    LineChart: ({
      children,
      data,
    }: {
      children: React.ReactNode;
      data?: Record<string, number>[];
    }) => (
      <div data-testid="line-chart" data-chart={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Line: ({ dataKey }: { dataKey: string }) => <div>{dataKey}</div>,
  };
});

const mockHokkaido: Prefecture = { prefCode: 1, prefName: '北海道' };
const mockTokyo: Prefecture = { prefCode: 13, prefName: '東京都' };

// 北海道のダミー人口データ
const mockHokkaidoPopulation = {
  boundaryYear: 2020,
  data: [
    { label: '総人口' as const, data: [{ year: 1960, value: 5000000 }] },
    {
      label: '年少人口' as const,
      data: [{ year: 1960, value: 1500000 }],
    },
    {
      label: '生産年齢人口' as const,
      data: [{ year: 1960, value: 3000000 }],
    },
    {
      label: '老年人口' as const,
      data: [{ year: 1960, value: 500000 }],
    },
  ],
};

// 東京都のダミー人口データ
const mockTokyoPopulation = {
  boundaryYear: 2020,
  data: [
    { label: '総人口' as const, data: [{ year: 1960, value: 9600000 }] },
    {
      label: '年少人口' as const,
      data: [{ year: 1960, value: 2000000 }],
    },
    {
      label: '生産年齢人口' as const,
      data: [{ year: 1960, value: 6800000 }],
    },
    {
      label: '老年人口' as const,
      data: [{ year: 1960, value: 800000 }],
    },
  ],
};

describe('PopulationChart コンポーネント', () => {
  // 未選択時のテスト
  it('都道府県が未選択のとき、案内メッセージが表示されること', () => {
    vi.spyOn(hooks, 'usePopulation').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PopulationChart selectedPrefectures={[]} />);
    expect(screen.getByText('都道府県を選択してください')).toBeInTheDocument();
  });

  // エラー時のテスト
  it('データ取得失敗時にエラーメッセージが表示されること', () => {
    vi.spyOn(hooks, 'usePopulation').mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('人口データの取得に失敗しました (ステータス: 500)'),
    });

    render(<PopulationChart selectedPrefectures={[mockHokkaido]} />);
    expect(
      screen.getByText('人口データの取得に失敗しました (ステータス: 500)'),
    ).toBeInTheDocument();
  });

  // 1つ選択時のテスト
  it('都道府県が選択されたとき、チャートにその都道府県が表示されること', () => {
    vi.spyOn(hooks, 'usePopulation').mockReturnValue({
      data: [{ pref: mockHokkaido, population: mockHokkaidoPopulation }],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PopulationChart selectedPrefectures={[mockHokkaido]} />);
    expect(screen.getByText('北海道')).toBeInTheDocument();
  });

  // 2つに増えた時（複数選択）のテスト
  it('選択する都道府県が2つに増えたとき、チャートに両方の都道府県が表示されること', () => {
    vi.spyOn(hooks, 'usePopulation').mockReturnValue({
      data: [
        { pref: mockHokkaido, population: mockHokkaidoPopulation },
        { pref: mockTokyo, population: mockTokyoPopulation },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PopulationChart selectedPrefectures={[mockHokkaido, mockTokyo]} />);
    expect(screen.getByText('北海道')).toBeInTheDocument();
    expect(screen.getByText('東京都')).toBeInTheDocument();
  });

  // 選択解除時のテスト
  it('都道府県の選択が解除されたとき、チャートから除外されること', () => {
    // 最初は2つあったが、東京が外れて北海道だけになった状態
    vi.spyOn(hooks, 'usePopulation').mockReturnValue({
      data: [{ pref: mockHokkaido, population: mockHokkaidoPopulation }],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PopulationChart selectedPrefectures={[mockHokkaido]} />);
    expect(screen.getByText('北海道')).toBeInTheDocument();
    expect(screen.queryByText('東京都')).not.toBeInTheDocument();
  });

  // タブ切り替え時のテスト
  it('カテゴリタブをクリックしたとき、アクティブなタブが切り替わること', async () => {
    const user = userEvent.setup();

    vi.spyOn(hooks, 'usePopulation').mockReturnValue({
      data: [{ pref: mockHokkaido, population: mockHokkaidoPopulation }],
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<PopulationChart selectedPrefectures={[mockHokkaido]} />);

    const youngTab = screen.getByRole('button', { name: '年少人口' });
    await user.click(youngTab);

    // 「年少人口」がアクティブ（青色）になったか確認
    expect(youngTab).toHaveClass('bg-blue-600');
  });
});
