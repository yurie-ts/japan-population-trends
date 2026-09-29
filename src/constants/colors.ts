import colors from 'tailwindcss/colors';

/**
 * tailwindcssのカラーパレットから選定したグラフ用カラーリスト
 */
export const LINE_COLORS = [
  colors.blue[600],
  colors.red[600],
  colors.emerald[600],
  colors.amber[600],
  colors.purple[600],
  colors.cyan[600],
  colors.orange[600],
  colors.indigo[600],
  colors.pink[600],
  colors.lime[600],
  colors.sky[600],
  colors.rose[600],
  colors.teal[600],
  colors.violet[600],
  colors.fuchsia[600],
  colors.yellow[600],
] as const;

/**
 * 選択順インデックスに応じた色を取得する（定義数を超えた場合は循環）
 */
export const getPrefectureColor = (index: number): string => {
  return LINE_COLORS[index % LINE_COLORS.length];
};
