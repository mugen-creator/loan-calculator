# カードローン返済シミュレーター

カードローンの返済計画を簡単にシミュレーションできるWebアプリケーションです。

## 機能

- **返済計算**
  - 元利均等返済
  - 元金均等返済
  - 返済期間または月々の返済額から計算

- **視覚化**
  - 残高推移グラフ
  - 元金・利息内訳グラフ
  - 詳細な返済スケジュール表

- **カードローン情報**
  - 主要カードローン5社の情報掲載
  - 金利、限度額、審査時間などの比較

## 技術スタック

- HTML5
- CSS3 (CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Chart.js 4.4.0

## セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd card-loan
```

2. ローカルサーバーで起動
```bash
# Python 3の場合
python3 -m http.server 8000

# Node.jsの場合
npx serve
```

3. ブラウザで http://localhost:8000 にアクセス

## デプロイ (Netlify)

1. Netlifyにログイン
2. 「New site from Git」を選択
3. リポジトリを選択
4. ビルド設定は不要（静的サイト）
5. デプロイ

## ブラウザサポート

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- iOS Safari 12+
- Android Chrome

## ライセンス

MIT License

## 注意事項

- シミュレーション結果は概算です
- 実際の返済額とは異なる場合があります
- 最新の情報は各カードローン会社の公式サイトでご確認ください
