# 23. Service と Ingress で公開する

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

![Service と Ingress の流れ](/flows/23_network.svg)

前の章では `NodePort` を使ってアプリにアクセスしました。

この章では、Kubernetes でよく使う公開の流れである `Service` と `Ingress` を使って、HTTP アクセスをルーティングします。

::: tip
k3s では標準で Ingress Controller として Traefik が動作します。
もし Traefik を無効化している環境では、別途 Ingress Controller が必要です。
:::

流れは次のようになります。

```text
ブラウザ / curl
  ↓
Ingress
  ↓
Service
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
kubectl get deployments
kubectl get pods
kubectl get svc
kubectl get ingress
```

実行結果例:

```bash
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-httpd   2/2     2            2           30s

NAME                        READY   STATUS    RESTARTS   AGE
my-httpd-7d7f85f8f9-8s2kp   1/1     Running   0          29s
my-httpd-7d7f85f8f9-v9z4m   1/1     Running   0          29s

NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
my-httpd     ClusterIP   10.43.130.41    <none>        80/TCP    30s
kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP   1d

NAME       CLASS    HOSTS                ADDRESS        PORTS   AGE
my-httpd   <none>   my-httpd.localhost   192.168.0.10   80      30s
```

## 23-3. Service 経由で確認する

まずは Kubernetes クラスター内から Service にアクセスできることを確認します。

```bash
kubectl run curl --image=docker.io/curlimages/curl:8.7.1 --rm -it --restart=Never -- \
  curl http://my-httpd
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

::: tip
`my-httpd` は Service 名です。
同じ Namespace 内の Pod からは、Service 名でアクセスできます。
:::

## 23-4. Ingress 経由でアクセスする

次に、Ingress 経由でアクセスします。
まず k3s の Node の IP アドレスを確認します。

```bash
kubectl get nodes -o wide
```

表示された `INTERNAL-IP` を使って、`Host` ヘッダーを指定して確認します。

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

::: tip
ローカル環境で `my-httpd.localhost` が名前解決できる場合は、ブラウザで `http://my-httpd.localhost` を開いても確認できます。
:::

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
kubectl get deployments
kubectl get svc
kubectl get ingress
```
