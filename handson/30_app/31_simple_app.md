# 31. 簡単なアプリ

最後は、少しだけ「アプリっぽい」ものを起動してみます。
ここでは、シンプルな HTML を返すだけのアプリをコンテナ化して、k3s 上で動かします。

## 31-1. アプリ用ディレクトリを作る

```bash
mkdir simple-app
cd simple-app
```

## 31-2. アプリのファイルを作成する

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

## 31-4. レジストリに push する

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

## 31-5. Kubernetes Manifest を作成する

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

## 31-6. デプロイする

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
kubectl get pods
kubectl get svc
```

実行結果例:

```bash
NAME                         READY   STATUS    RESTARTS   AGE
simple-app-65fd6f8fc-4d9tw   1/1     Running   0          30s

NAME         TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
simple-app   NodePort   10.43.245.201   <none>        80:30081/TCP   29s
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
