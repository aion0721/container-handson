# 91. まとめ

![ページのイメージ図](/illustrations/conclusion.svg)


このハンズオンでは、以下の内容を体験しました。

- `podman pull` でコンテナイメージを取得する
- `podman run` でコンテナを起動する
- `podman stop` / `podman rm` で停止・削除する
- `Containerfile` を使って独自イメージをビルドする
- `kubectl apply` で Kubernetes にデプロイする
- Deployment による Pod の自然復旧を確認する
- Service と Ingress でアプリへのアクセス経路を作る
- 簡単なアプリを k3s 上で公開する

コンテナを扱ううえでは、まずは次の 3 つを押さえるのが大切です。

1. イメージを取得する
2. コンテナを動かす
3. 必要に応じて自分でイメージを作る

この基本がわかると、その先の Kubernetes もかなり理解しやすくなります。

## 参考情報（困ったときに見る先）

実務で詰まりやすいポイントを調べるときは、まず公式ドキュメントを確認すると早いです。

- Podman 公式ドキュメント: https://docs.podman.io/
- Kubernetes 公式ドキュメント: https://kubernetes.io/docs/home/
- kubectl チートシート: https://kubernetes.io/docs/reference/kubectl/quick-reference/
- Kubernetes API リファレンス: https://kubernetes.io/docs/reference/generated/kubernetes-api/

### トラブルシュートの観点

- コンテナが起動しない: `podman logs <container_name>` / `podman inspect <container_name>`
- Pod が `Running` にならない: `kubectl describe pod <pod_name>` / `kubectl logs <pod_name>`
- Service 経由でつながらない: `kubectl get svc` と `kubectl get endpoints` で関連付けを確認
- Manifest の反映差分を見たい: `kubectl diff -f <manifest.yaml>`
- Ingress のルーティングを確認したい: `kubectl describe ingress <ingress_name>`
