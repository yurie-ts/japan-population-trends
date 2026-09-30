import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * @description
 * 統計データに対するキャッシュ戦略（staleTime: 30分 / gcTime: 1時間）の有効性を検証する統合テスト。
 * Vitest の Fake Timers を用いて時間経過をシミュレートし、以下の仕様を満たすことを保証する。
 * 1. 30分以内（staleTime）: データは fresh 状態を維持し、コンポーネント再マウント時も追加通信を発生させない。
 * 2. 30分経過後: データは stale 状態に遷移し、再マウント時にバックグラウンドで最新データを再取得する。
 * 3. 非アクティブ化から1時間（gcTime）経過後: ガベージコレクションによりメモリから破棄される。
 */
describe('TanStack Query キャッシュライフサイクル検証', () => {
  it('staleTime（30分）内は通信を抑制し、gcTime（1時間）後にメモリから破棄されること', async () => {
    vi.useFakeTimers();

    let apiCallCount = 0;
    const mockApi = async () => {
      apiCallCount++;
      return { population: '東京都の人口データ' };
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 30, // 30分間は fresh とみなす
          gcTime: 1000 * 60 * 60, // 非アクティブ後1時間はメモリ保持
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const advanceTime = (minutes: number) => {
      const ms = minutes * 60 * 1000;
      vi.advanceTimersByTime(ms);
      vi.setSystemTime(new Date(Date.now() + ms));
    };

    // 1. 初回マウント（データフェッチ実行）
    const hook1 = renderHook(
      () => useQuery({ queryKey: ['pref', 13], queryFn: mockApi }),
      { wrapper },
    );
    await vi.waitFor(() => expect(hook1.result.current.isSuccess).toBe(true));

    const queryInitial = queryClient.getQueryCache().find({ queryKey: ['pref', 13] });
    expect(apiCallCount).toBe(1);
    expect(queryInitial?.isStale()).toBe(false);

    // 2. 10分経過時（staleTime 30分以内）
    advanceTime(10);
    hook1.rerender();
    const queryAt10m = queryClient.getQueryCache().find({ queryKey: ['pref', 13] });
    expect(apiCallCount).toBe(1); // 追加通信が発生しないことを検証
    expect(queryAt10m?.isStale()).toBe(false); // fresh 状態を維持

    // 3. 35分経過時（staleTime 30分超過後）
    advanceTime(25);
    const queryAt35m = queryClient.getQueryCache().find({ queryKey: ['pref', 13] });
    expect(queryAt35m?.isStale()).toBe(true); // 自動的に stale 状態へ遷移することを検証

    // stale 状態での再マウント（チェック外し -> 再チェック）
    hook1.unmount();
    const hook2 = renderHook(
      () => useQuery({ queryKey: ['pref', 13], queryFn: mockApi }),
      { wrapper },
    );
    await vi.waitFor(() => expect(apiCallCount).toBe(2));
    expect(apiCallCount).toBe(2); // stale のため最新データの再取得が走ることを検証

    // 4. アンマウント後 24分経過（非アクティブ状態での保持確認）
    hook2.unmount();
    advanceTime(24);
    const queryAt59m = queryClient.getQueryCache().find({ queryKey: ['pref', 13] });
    expect(queryAt59m?.state.data).toBeDefined(); // メモリ上にキャッシュが残存していることを検証

    // 5. アンマウントから累計1時間以上経過（gcTime 超過）
    advanceTime(70);
    await vi.runAllTimersAsync();
    const queryAfterGc = queryClient.getQueryCache().find({ queryKey: ['pref', 13] });
    expect(queryAfterGc).toBeUndefined(); // ガベージコレクションにより完全に破棄されたことを検証

    vi.useRealTimers();
  });
});
