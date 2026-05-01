# 23. Service と Ingress で公開する

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

![Service と Ingress の流れ](/flows/23_network.svg)

前の章では `NodePort` を使って、`http://localhost:30080` のようにポート番号を指定してアプリにアクセスしました。

この章では、`Service` と `Ingress` の役割の違いを確認します。
ポイントは、`Service` はポートを使って Pod へつなぎ、`Ingress` は `my-httpd.localhost` のような名前を使って HTTP アクセスを振り分けることです。

つまり、アクセスの見え方は次のように変わります。

```text
Service: http://localhost:30080 のようにポート番号でアクセスする
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
  type: ClusterIP

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
  type: ClusterIP

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
`Service` の `type` は `ClusterIP` です。
`NodePort` のように直接ポートを公開せず、Ingress から Service に接続します。
:::

## 23-2. デプロイする

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

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/my-httpd     ClusterIP   10.43.130.41    <none>        80/TCP    30s
service/kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP   1d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-httpd   2/2     2            2           30s

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-httpd-7d7f85f8f9   2         2         2       30s

NAME       CLASS    HOSTS                ADDRESS        PORTS   AGE
my-httpd   <none>   my-httpd.localhost   192.168.0.10   80      30s
```

## 23-3. Service はポートで接続する

まずは Kubernetes クラスター内から Service にアクセスできることを確認します。
Service は、`port: 80` で受けた通信を、Pod 側の `targetPort: 80` へ転送します。

```yaml
ports:
  - port: 80
    targetPort: 80
```

クラスター内から Service 名とポート番号を指定してアクセスします。

```bash
kubectl run curl --image=docker.io/curlimages/curl:8.7.1 --rm -it --restart=Never -- \
  curl http://my-httpd:80
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

::: tip
`my-httpd` は Service 名です。
同じ Namespace 内の Pod からは、Service 名でアクセスできます。
前の章の `NodePort` では、クラスター外から `localhost:30080` のようにポート番号でアクセスしました。
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

ここでは `http://localhost:30080` のようなアプリ用の `NodePort` は指定していません。
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

## 23-5. ルーティングを確認する

Ingress の詳細を確認します。

```bash
kubectl describe ingress my-httpd
```

確認するポイント:

- `Host` が `my-httpd.localhost` になっていること
- `Backend` が `my-httpd:80` になっていること
- `Rules` に `/` のルーティングがあること

Pod、Service、Ingress の関係を改めて確認します。

```bash
kubectl get pods -l app=my-httpd
kubectl get endpoints my-httpd
kubectl get ingress my-httpd
```

`endpoints` には、Service の接続先になっている Pod の IP アドレスが表示されます。

## 23-6. 削除する

```bash
kubectl delete -f network.yaml
```

削除されたことを確認します。

```bash
kubectl get all
kubectl get ingress
```
