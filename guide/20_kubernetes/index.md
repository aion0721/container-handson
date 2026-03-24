# 20. Kubernetes 編

この章では Kubernetes 環境である `k3s` を使って、アプリをデプロイします。

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
