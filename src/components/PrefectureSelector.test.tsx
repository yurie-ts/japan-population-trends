import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PrefectureSelector from './PrefectureSelector';
import * as hooks from '@/hooks/usePrefectures';

// テスト用のダミー都道府県データ
const mockPrefectures = [
  { prefCode: 1, prefName: '北海道' },
  { prefCode: 13, prefName: '東京都' },
];

describe('PrefectureSelector コンポーネント', () => {
  // ローディング中のテスト
  it('データ取得中はローディング表示がされること', () => {
    vi.spyOn(hooks, 'usePrefectures').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof hooks.usePrefectures>);

    render(
      <PrefectureSelector
        selectedPrefectures={[]}
        onSelectionChange={() => {}}
      />,
    );

    expect(screen.getByText('都道府県一覧を読み込み中...')).toBeInTheDocument();
  });

  // エラー時のテスト
  it('データ取得失敗時にエラーメッセージが表示されること', () => {
    vi.spyOn(hooks, 'usePrefectures').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('APIエラーが発生しました (ステータス: 500)'),
    } as unknown as ReturnType<typeof hooks.usePrefectures>);

    render(
      <PrefectureSelector
        selectedPrefectures={[]}
        onSelectionChange={() => {}}
      />,
    );

    expect(
      screen.getByText('APIエラーが発生しました (ステータス: 500)'),
    ).toBeInTheDocument();
  });

  // 成功時の表示テスト
  it('データ取得成功時に都道府県チェックボックスが表示されること', () => {
    vi.spyOn(hooks, 'usePrefectures').mockReturnValue({
      data: mockPrefectures,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof hooks.usePrefectures>);

    render(
      <PrefectureSelector
        selectedPrefectures={[]}
        onSelectionChange={() => {}}
      />,
    );

    // 「北海道」と「東京都」のチェックボックスが表示されているか確認
    expect(screen.getByLabelText('北海道')).toBeInTheDocument();
    expect(screen.getByLabelText('東京都')).toBeInTheDocument();
  });

  // チェックボックス選択時の動作テスト
  it('チェックボックスをクリックした時、onSelectionChange が正しく呼ばれること', async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn(); // 呼ばれたかチェックするモック関数

    vi.spyOn(hooks, 'usePrefectures').mockReturnValue({
      data: mockPrefectures,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof hooks.usePrefectures>);

    render(
      <PrefectureSelector
        selectedPrefectures={[]}
        onSelectionChange={handleSelectionChange}
      />,
    );

    // 「北海道」をクリック
    const checkbox = screen.getByLabelText('北海道');
    await user.click(checkbox);

    // 北海道が追加された配列で親の関数が呼ばれたかチェック
    expect(handleSelectionChange).toHaveBeenCalledWith([
      { prefCode: 1, prefName: '北海道' },
    ]);
  });

  // すべて解除ボタンの動作テスト
  it('「すべて解除」ボタンをクリックした時、空の配列で onSelectionChange が呼ばれること', async () => {
    const user = userEvent.setup();
    const handleSelectionChange = vi.fn();

    vi.spyOn(hooks, 'usePrefectures').mockReturnValue({
      data: mockPrefectures,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof hooks.usePrefectures>);

    render(
      <PrefectureSelector
        selectedPrefectures={[{ prefCode: 1, prefName: '北海道' }]}
        onSelectionChange={handleSelectionChange}
      />,
    );

    const clearButton = screen.getByRole('button', { name: 'すべて解除' });
    expect(clearButton).not.toBeDisabled();
    await user.click(clearButton);

    expect(handleSelectionChange).toHaveBeenCalledWith([]);
  });

  // 未選択時のボタン非活性テスト
  it('都道府県が未選択の時、「すべて解除」ボタンが無効化されていること', () => {
    vi.spyOn(hooks, 'usePrefectures').mockReturnValue({
      data: mockPrefectures,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof hooks.usePrefectures>);

    render(
      <PrefectureSelector
        selectedPrefectures={[]}
        onSelectionChange={() => {}}
      />,
    );

    const clearButton = screen.getByRole('button', { name: 'すべて解除' });
    expect(clearButton).toBeDisabled();
  });
});
