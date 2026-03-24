# Podman と k3s ではじめるコンテナハンズオン

## はじめに

このハンズオンでは、`podman` を使ってコンテナの基本操作を体験し、その後 `k3s` を使って Kubernetes 上でアプリケーションを動かします。

最初は `httpd` イメージを使いながら、以下の流れで進めます。

1. コンテナイメージの取得・削除
2. コンテナの起動・停止・削除
3. コンテナイメージのビルド・修正
4. k3s を使った簡易デプロイ
5. 最後に簡単なアプリを起動

## ゴール

このハンズオンを終えると、次のことができるようになります。

- コンテナイメージを取得・確認・削除できる
- コンテナを起動・停止・削除できる
- `Containerfile` を使って独自イメージを作成できる
- Kubernetes にアプリをデプロイできる
- ローカルで作ったアプリをコンテナ経由で実行できる

## 前提条件

このハンズオンでは以下を前提とします。

- Linux 環境、または Linux コマンドが使える環境
- `podman` がインストール済みであること
- `k3s` が利用可能であること
- `curl` またはブラウザで動作確認できること

::: tip
コマンドは例として記載しています。環境によって `sudo` が必要な場合があります。
:::

# 1. コンテナイメージの取得と削除

まずは、コンテナイメージを取得してみます。

## 1-1. イメージを取得する

以下のコマンドで `httpd` イメージを取得します。

```bash
podman pull docker.io/library/httpd:2.4
```

取得できたら、ローカルに存在するイメージ一覧を確認します。

```bash
podman images
```

出力例:

```bash
REPOSITORY                 TAG      IMAGE ID      CREATED      SIZE
docker.io/library/httpd    2.4      xxxxxxxxxxxx  x days ago   xxx MB
```

## 1-2. イメージの詳細を確認する

```bash
podman image inspect docker.io/library/httpd:2.4
```

イメージのメタデータや設定内容を確認できます。

## 1-3. イメージを削除する

不要になったイメージは削除できます。

```bash
podman rmi docker.io/library/httpd:2.4
```

削除後、再度一覧を確認してみましょう。

```bash
podman images
```

::: warning
そのイメージを利用中のコンテナが存在する場合、イメージ削除に失敗することがあります。
その場合は先にコンテナを削除してください。
:::

# 2. コンテナの起動・停止・削除

次は、取得したイメージを使ってコンテナを動かします。

## 2-1. コンテナを起動する

再度イメージを取得します。

```bash
podman pull docker.io/library/httpd:2.4
```

`8080` 番ポートで公開して起動します。

```bash
podman run -d --name my-httpd -p 8080:80 docker.io/library/httpd:2.4
```

オプションの意味は以下の通りです。

- `-d`: バックグラウンド起動
- `--name my-httpd`: コンテナ名を指定
- `-p 8080:80`: ホストの 8080 番をコンテナの 80 番に転送

## 2-2. 起動中のコンテナを確認する

```bash
podman ps
```

ブラウザまたは `curl` でアクセスしてみます。

```bash
curl http://localhost:8080
```

Apache HTTP Server の初期ページが返ってくれば成功です。

## 2-3. コンテナを停止する

```bash
podman stop my-httpd
```

停止後、起動中コンテナ一覧から消えたことを確認します。

```bash
podman ps
```

停止済みコンテナも含めて確認する場合は以下です。

```bash
podman ps -a
```

## 2-4. コンテナを再起動する

```bash
podman start my-httpd
```

再度アクセス確認してみましょう。

```bash
curl http://localhost:8080
```

## 2-5. コンテナを削除する

まず停止します。

```bash
podman stop my-httpd
```

その後、削除します。

```bash
podman rm my-httpd
```

確認します。

```bash
podman ps -a
```

# 3. コンテナイメージをビルドして修正する

ここからは、`httpd` をベースに独自の Web ページを表示するイメージを作ります。

## 3-1. 作業ディレクトリを作成する

```bash
mkdir podman-httpd-handson
cd podman-httpd-handson
```

## 3-2. HTML ファイルを作成する

`index.html` を作成します。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Podman Hands-on</title>
  </head>
  <body>
    <h1>Hello Podman!</h1>
    <p>このページは独自にビルドしたコンテナイメージで動いています。</p>
  </body>
</html>
```

## 3-3. Containerfile を作成する

`Containerfile` を作成します。

```dockerfile
FROM docker.io/library/httpd:2.4

COPY index.html /usr/local/apache2/htdocs/index.html
```

## 3-4. イメージをビルドする

```bash
podman build -t my-httpd:v1 .
```

ビルド後、一覧を確認します。

```bash
podman images
```

## 3-5. ビルドしたイメージを起動する

```bash
podman run -d --name my-httpd-v1 -p 8080:80 my-httpd:v1
```

表示確認:

```bash
curl http://localhost:8080
```

`Hello Podman!` が表示されれば成功です。

## 3-6. ページを修正する

`index.html` を編集してみます。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Podman Hands-on</title>
  </head>
  <body>
    <h1>Hello Podman v2!</h1>
    <p>コンテナイメージを修正して再ビルドしました。</p>
    <p>この変更は新しいイメージとして反映されます。</p>
  </body>
</html>
```

コンテナを停止・削除します。

```bash
podman stop my-httpd-v1
podman rm my-httpd-v1
```

再ビルドします。

```bash
podman build -t my-httpd:v2 .
```

再度起動します。

```bash
podman run -d --name my-httpd-v2 -p 8080:80 my-httpd:v2
```

確認します。

```bash
curl http://localhost:8080
```

表示が `Hello Podman v2!` に変わっていれば、修正と再ビルドが成功しています。

# 4. k3s を使って簡易的に起動する

次は Kubernetes 環境である `k3s` を使って、同じようなアプリをデプロイします。

## 4-1. Pod を作る

まずは動作確認として、`httpd` の Pod を直接作成します。

```bash
kubectl run httpd --image=docker.io/library/httpd:2.4 --port=80
```

Pod の状態を確認します。

```bash
kubectl get pods
```

## 4-2. Service を作る

Pod にアクセスできるように Service を作成します。

```bash
kubectl expose pod httpd --type=NodePort --port=80
```

Service を確認します。

```bash
kubectl get svc
```

NodePort が割り当てられているので、そのポートにアクセスします。

```bash
curl http://localhost:<NodePort>
```

::: tip
`<NodePort>` の部分は `kubectl get svc` の結果を見て置き換えてください。
:::

## 4-3. 後片付け

```bash
kubectl delete svc httpd
kubectl delete pod httpd
```

# 5. Manifest でデプロイする

実際の運用では、コマンド一発よりも YAML で管理することが多いため、Manifest を使ってデプロイします。

## 5-1. deployment.yaml を作成する

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-httpd
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-httpd
  template:
    metadata:
      labels:
        app: my-httpd
    spec:
      containers:
        - name: httpd
          image: docker.io/library/httpd:2.4
          ports:
            - containerPort: 80

apiVersion: v1
kind: Service
metadata:
  name: my-httpd
spec:
  selector:
    app: my-httpd
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
  type: NodePort
```

## 5-2. デプロイする

```bash
kubectl apply -f deployment.yaml
```

確認します。

```bash
kubectl get deployments
kubectl get pods
kubectl get svc
```

アクセス確認:

```bash
curl http://localhost:30080
```

## 5-3. 削除する

```bash
kubectl delete -f deployment.yaml
```

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
