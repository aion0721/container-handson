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
