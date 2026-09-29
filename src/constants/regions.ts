/**
 * 地方の定義
 */
export interface Region {
  regionName: string;
  prefNames: string[];
}

/**
 * 日本の7地方区分と、各地方に属する都道府県名
 * （都道府県一覧取得APIのレスポンスに含まれる正式な都道府県名と対応）
 */
export const REGIONS: Region[] = [
  {
    regionName: '北海道・東北',
    prefNames: [
      '北海道',
      '青森県',
      '岩手県',
      '宮城県',
      '秋田県',
      '山形県',
      '福島県',
    ],
  },
  {
    regionName: '関東',
    prefNames: [
      '茨城県',
      '栃木県',
      '群馬県',
      '埼玉県',
      '千葉県',
      '東京都',
      '神奈川県',
    ],
  },
  {
    regionName: '北陸・中部',
    prefNames: [
      '新潟県',
      '富山県',
      '石川県',
      '福井県',
      '山梨県',
      '長野県',
      '岐阜県',
      '静岡県',
      '愛知県',
    ],
  },
  {
    regionName: '近畿',
    prefNames: [
      '三重県',
      '滋賀県',
      '京都府',
      '大阪府',
      '兵庫県',
      '奈良県',
      '和歌山県',
    ],
  },
  {
    regionName: '中国',
    prefNames: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  },
  {
    regionName: '四国',
    prefNames: ['徳島県', '香川県', '愛媛県', '高知県'],
  },
  {
    regionName: '九州・沖縄',
    prefNames: [
      '福岡県',
      '佐賀県',
      '長崎県',
      '熊本県',
      '大分県',
      '宮崎県',
      '鹿児島県',
      '沖縄県',
    ],
  },
];
