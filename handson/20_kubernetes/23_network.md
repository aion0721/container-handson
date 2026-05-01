# 23. Service と Ingress で公開する

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

![Service と Ingress の流れ](/flows/23_network.svg)

前の章では `NodePort` を使って、`http://localhost:30080` のようにポート番号を指定してアプリにアクセスしました。

この章では、`Service` と `Ingress` の役割の違いを確認します。
ポイントは、`Service` はポートを使って Pod へつなぎ、`Ingress` は `my-httpd.localhost` のような名前を使って HTTP アクセスを振り分けることです。

つまり、アクセスの見え方は次のように変わります。

```text
Service: http://localhost:30083 のようにポート番号でアクセスする
Ingress: http://my-httpd.localhost のように名前でアクセスする
```

::: tip
k3s では標準で Ingress Controller として Traefik が動作します。
もし Traefik を無効化している環境では、別途 Ingress Controller が必要です。
:::

流れは次のようになります。

```text
ブラウザ / curl（http://my-httpd.localhost）
  ↓
Ingress（名前で振り分け）
  ↓
Service（Pod のポートへ接続）
  ↓
Pod
```

## 23-1. network.yaml を作成する

`network.yaml` を作成します。

```bash
cat <<'EOF' > network.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-httpd
spec:
  replicas: 2
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

---
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
      nodePort: 30083
  type: NodePort

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-httpd
spec:
  rules:
    - host: my-httpd.localhost
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-httpd
                port:
                  number: 80
EOF
```

作成する内容は次の通りです。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-httpd
spec:
  replicas: 2
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

---
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
      nodePort: 30083
  type: NodePort

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-httpd
spec:
  rules:
    - host: my-httpd.localhost
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-httpd
                port:
                  number: 80
```

::: tip
ここでは比較しやすいように、`Service` の `type` を `NodePort` にしています。
Ingress も同じ Service の `port: 80` に接続します。
:::

## 23-2. デプロイする

::: warning
この章では分かりやすさのために `nodePort: 30083` を固定しています。
同じクラスターを複数人で共有する場合は、受講者ごとに Namespace や NodePort を分けてください。
:::

```bash
kubectl apply -f network.yaml
```

実行結果例:

```bash
deployment.apps/my-httpd created
service/my-httpd created
ingress.networking.k8s.io/my-httpd created
```

作成されたリソースを確認します。

```bash
kubectl get all
kubectl get ingress
```

実行結果例:

```bash
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-httpd-7d7f85f8f9-8s2kp   1/1     Running   0          29s
pod/my-httpd-7d7f85f8f9-v9z4m   1/1     Running   0          29s

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/my-httpd     NodePort    10.43.130.41    <none>        80:30083/TCP   30s
service/kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-httpd   2/2     2            2           30s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-httpd-7d7f85f8f9   2         2         2       30s

NAME       CLASS    HOSTS                ADDRESS        PORTS   AGE
my-httpd   <none>   my-httpd.localhost   192.168.0.10   80      30s
```

## 23-3. Service はポートで接続する

まずは Service 経由でアクセスできることを確認します。
`NodePort` の Service は、ホスト側の `nodePort: 30083` で受けた通信を、Service の `port: 80`、Pod 側の `targetPort: 80` へ転送します。

```yaml
ports:
  - port: 80
    targetPort: 80
    nodePort: 30083
```

ホスト側から、ポート番号を指定してアクセスします。

```bash
curl http://localhost:30083
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

::: tip
同じ Namespace 内の Pod からは、`http://my-httpd:80` のように Service 名でもアクセスできます。
ただし、この章で比較したいポイントは、外から見ると Service は `localhost:30083` のようにポート番号でアクセスする、という点です。
:::

## 23-4. Ingress は名前で振り分ける

次に、Ingress 経由でアクセスします。
Ingress では、`host: my-httpd.localhost` のようにホスト名を指定して、どの Service へ流すかを決めます。

```yaml
rules:
  - host: my-httpd.localhost
```

ローカル環境で `my-httpd.localhost` が名前解決できる場合は、次のようにアクセスできます。

```bash
curl http://my-httpd.localhost
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

ここでは `http://localhost:30083` のようなアプリ用の `NodePort` は指定していません。
Ingress が `my-httpd.localhost` という名前を見て、`my-httpd` Service へルーティングしています。

SSH 接続先の Linux サーバー上で作業している場合など、手元の端末から `my-httpd.localhost` でアクセスできないときは、Node の IP アドレスと `Host` ヘッダーを使って確認します。

まず k3s の Node の IP アドレスを確認します。

```bash
kubectl get nodes -o wide
```

表示された `INTERNAL-IP` を使って、`Host` ヘッダーに `my-httpd.localhost` を指定します。

```bash
curl -H "Host: my-httpd.localhost" http://<Node の INTERNAL-IP>
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

::: tip
k3s を自分の PC 上で動かしている場合は、次のように `localhost` で確認できることもあります。
:::

```bash
curl -H "Host: my-httpd.localhost" http://localhost
```

ブラウザで確認する場合も、`http://my-httpd.localhost` を開きます。

## 23-5. 発展: nip.io で名前解決する

`my-httpd.localhost` はローカル環境では便利ですが、SSH 接続先の Linux サーバーや共有サーバーでは、手元のブラウザからそのまま名前解決できないことがあります。
そのようなときは、`nip.io` のようなワイルドカード DNS サービスを使うと、`/etc/hosts` を編集せずに名前ベースのアクセスを試せます。

`nip.io` は、ホスト名に含まれる IP アドレスへ名前解決してくれるサービスです。
たとえば、`my-httpd.192.168.0.10.nip.io` は `192.168.0.10` に解決されます。

まず k3s の Node の IP アドレスを確認します。

```bash
kubectl get nodes -o wide
```

表示された `INTERNAL-IP` が `192.168.0.10` だった場合、Ingress の `host` を次のように変更します。

```yaml
rules:
  - host: my-httpd.192.168.0.10.nip.io
```

`network.yaml` を編集したら、再度 `apply` します。

```bash
kubectl apply -f network.yaml
```

名前ベースでアクセスします。

```bash
curl http://my-httpd.192.168.0.10.nip.io
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

ブラウザからも `http://my-httpd.192.168.0.10.nip.io` のような URL で確認できます。
IP アドレスが変わる場合は、Ingress の `host` も新しい IP アドレスに合わせて変更してください。

::: warning
`nip.io` は外部の DNS サービスです。
ネットワーク環境によっては、プライベート IP アドレスへの名前解決が DNS Rebinding Protection によってブロックされる場合があります。
その場合は、`Host` ヘッダーを指定する方法や `/etc/hosts` を使う方法で確認してください。
:::

参考: [nip.io](https://nip.io/)

## 23-6. ルーティングを確認する

Ingress の詳細を確認します。

```bash
kubectl describe ingress my-httpd
```

確認するポイント:

- `Host` が `my-httpd.localhost`、または発展手順で設定した `my-httpd.<Node IP>.nip.io` になっていること
- `Backend` が `my-httpd:80` になっていること
- `Rules` に `/` のルーティングがあること

Pod、Service、Ingress の関係を改めて確認します。

```bash
kubectl get pods -l app=my-httpd
kubectl get endpoints my-httpd
kubectl get ingress my-httpd
```

`endpoints` には、Service の接続先になっている Pod の IP アドレスが表示されます。

## 23-7. 削除する

```bash
kubectl delete -f network.yaml
```

削除されたことを確認します。

```bash
kubectl get all
kubectl get ingress
```
