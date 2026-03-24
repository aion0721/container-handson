# k3sとは

![ページのイメージ図](/illustrations/guide.svg)


k3s は、軽量化された Kubernetes ディストリビューションです。

## k3s の特徴

- **軽量**: 小規模環境でも動かしやすい
- **導入が比較的簡単**: 検証・学習を始めやすい
- **Kubernetes 互換**: 基本的な Kubernetes の概念や操作を学べる

## どんなときに使うか

- ローカル検証環境を素早く用意したいとき
- Kubernetes 学習をシンプルに始めたいとき
- エッジや小規模構成で運用したいとき

## 最低限おさえる用語

- **Node**: Pod を実行するマシン
- **Pod**: コンテナを実行する最小単位
- **Deployment**: Pod のレプリカ管理やローリング更新を担うリソース
- **Service**: Pod へのアクセス経路を提供するリソース

具体的な操作は [Hands-on の Kubernetes 編](/handson/20_kubernetes/) で確認できます。
