# 30. アプリ編

この章では、シンプルなアプリをコンテナ化して `k3s` 上で動かします。

# 6. 最後に簡単なアプリを起動する

最後は、少しだけ「アプリっぽい」ものを起動してみます。
ここでは、シンプルな HTML を返すだけのアプリをコンテナ化して、k3s 上で動かします。

## 6-1. アプリ用ディレクトリを作る

```bash
mkdir simple-app
cd simple-app
```

## 6-2. アプリのファイルを作成する

`index.html`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Simple App</title>
  </head>
  <body>
    <h1>社内ハンズオン アプリ</h1>
    <p>Podman でビルドし、k3s で起動しています。</p>
    <ul>
      <li>イメージ取得</li>
      <li>コンテナ起動</li>
      <li>イメージビルド</li>
      <li>Kubernetes デプロイ</li>
    </ul>
  </body>
</html>
```

`Containerfile`

```dockerfile
FROM docker.io/library/httpd:2.4

COPY index.html /usr/local/apache2/htdocs/index.html
```

## 6-3. イメージをビルドする

```bash
podman build -t simple-app:v1 .
```

## 6-4. レジストリに push する

k3s から参照できるレジストリに push してください。
ここでは例として `registry.example.local` を利用します。

```bash
podman tag simple-app:v1 registry.example.local/simple-app:v1
podman push registry.example.local/simple-app:v1
```

::: warning
環境によっては、ローカルレジストリや社内レジストリの事前準備が必要です。
この部分は自組織の環境に合わせて読み替えてください。
:::

## 6-5. Kubernetes Manifest を作成する

`simple-app.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: simple-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: simple-app
  template:
    metadata:
      labels:
        app: simple-app
    spec:
      containers:
        - name: simple-app
          image: registry.example.local/simple-app:v1
          ports:
            - containerPort: 80

---
apiVersion: v1
kind: Service
metadata:
  name: simple-app
spec:
  selector:
    app: simple-app
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30081
  type: NodePort
```

## 6-6. デプロイする

```bash
kubectl apply -f simple-app.yaml
```

状態確認:

```bash
kubectl get pods
kubectl get svc
```

アクセス確認:

```bash
curl http://localhost:30081
```

ページが表示されれば成功です。

# 7. まとめ

このハンズオンでは、以下の内容を体験しました。

- `podman pull` でコンテナイメージを取得する
- `podman run` でコンテナを起動する
- `podman stop` / `podman rm` で停止・削除する
- `Containerfile` を使って独自イメージをビルドする
- `kubectl apply` で Kubernetes にデプロイする
- 簡単なアプリを k3s 上で公開する

コンテナを扱ううえでは、まずは以下の 3 つを押さえるのが大切です。

1. イメージを取得する
2. コンテナを動かす
3. 必要に応じて自分でイメージを作る

この基本がわかると、その先の Kubernetes もかなり理解しやすくなります。

# 8. 次のステップ

余裕があれば、次の内容にもチャレンジしてみてください。

- `podman logs` でログを確認する
- `podman exec` でコンテナの中に入る
- Kubernetes の `Ingress` を使って公開する
- Deployment のレプリカ数を増やす
- ConfigMap を使って設定値を外出しする

## 参考コマンド集

### Podman

```bash
podman pull docker.io/library/httpd:2.4
podman images
podman image inspect docker.io/library/httpd:2.4
podman run -d --name my-httpd -p 8080:80 docker.io/library/httpd:2.4
podman ps
podman ps -a
podman stop my-httpd
podman start my-httpd
podman rm my-httpd
podman rmi docker.io/library/httpd:2.4
podman build -t my-httpd:v1 .
```

### Kubernetes

```bash
kubectl get pods
kubectl get svc
kubectl get deployments
kubectl apply -f deployment.yaml
kubectl delete -f deployment.yaml
kubectl run httpd --image=docker.io/library/httpd:2.4 --port=80
kubectl expose pod httpd --type=NodePort --port=80
```
