// 都道府県データ
export interface Prefecture {
  prefCode: number; // 都道府県コード (例: 1)
  prefName: string; // 都道府県名 (例: "北海道")
}

// 都道府県一覧取得APIのレスポンス
export interface PrefecturesApiResponse {
  message: string | null;
  result: Prefecture[];
}
