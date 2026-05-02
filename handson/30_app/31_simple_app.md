# 31. 簡単なアプリ

![ページのイメージ図](/illustrations/apps.svg)


ここでは、シンプルな HTML を返すだけのアプリをコンテナ化して、`k3s` 上で動かします。

## この章で達成したいこと

自分で用意したファイルをコンテナイメージに含めて、Kubernetes 上で動かせるようにします。

これができると、次のようなことにつながります。

- 手元で作った小さな Web ページや静的コンテンツを、コンテナとして配布できる
- `Containerfile` に「アプリをどう実行するか」を残せる
- `Deployment` と `Service` を使って、作ったアプリを `k3s` 上で公開できる

この章では、その最小例として `index.html` を `httpd` イメージに入れて動かします。

## 31-1. アプリ用ディレクトリを作る

```bash
mkdir simple-app
cd simple-app
```

## 31-2. アプリのファイルを作成する

`index.html`

```bash
cat <<'EOF' > index.html
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
EOF
```

作成する内容は次の通りです。

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

```bash
cat <<'EOF' > Containerfile
FROM docker.io/library/httpd:2.4

COPY index.html /usr/local/apache2/htdocs/index.html
EOF
```

作成する内容は次の通りです。

```dockerfile
FROM docker.io/library/httpd:2.4

COPY index.html /usr/local/apache2/htdocs/index.html
```

## 31-3. イメージをビルドする

```bash
podman build -t simple-app:v1 .
```

実行結果例:

```bash
STEP 1/2: FROM docker.io/library/httpd:2.4
STEP 2/2: COPY index.html /usr/local/apache2/htdocs/index.html
COMMIT simple-app:v1
Successfully tagged localhost/simple-app:v1
```

## 31-4. k3s にイメージを取り込む

Podman でビルドしたイメージを、k3s が利用するコンテナランタイムに取り込みます。

```bash
podman save simple-app:v1 -o simple-app-v1.tar
sudo k3s ctr images import simple-app-v1.tar
```

::: tip
k3s が複数ノードで動いている場合は、Pod が起動する可能性のある各ノードにイメージを取り込む必要があります。
:::

## 31-5. Kubernetes Manifest を作成する

`simple-app.yaml`

```bash
cat <<'EOF' > simple-app.yaml
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
          image: simple-app:v1
          imagePullPolicy: Never
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
EOF
```

作成する内容は次の通りです。

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
          image: simple-app:v1
          imagePullPolicy: Never
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

## 31-6. デプロイする

::: warning
この章では分かりやすさのために `nodePort: 30081` を固定しています。
同じクラスターを複数人で共有する場合は、受講者ごとに Namespace や NodePort を分けてください。
:::

```bash
kubectl apply -f simple-app.yaml
```

実行結果例:

```bash
deployment.apps/simple-app created
service/simple-app created
```

状態確認:

```bash
kubectl get all
```

実行結果例:

```bash
NAME                              READY   STATUS    RESTARTS   AGE
pod/simple-app-65fd6f8fc-4d9tw   1/1     Running   0          30s

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/simple-app   NodePort    10.43.245.201   <none>        80:30081/TCP   29s
service/kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/simple-app   1/1     1            1           30s

NAME                                    DESIRED   CURRENT   READY   AGE
replicaset.apps/simple-app-65fd6f8fc   1         1         1       30s
```

アクセス確認:

```bash
curl http://localhost:30081
```

実行結果例:

```html
<h1>社内ハンズオン アプリ</h1>
```

ページが表示されれば成功です。
