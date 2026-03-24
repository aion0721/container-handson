# 22. Manifest でデプロイする

![ページのイメージ図](/illustrations/kubernetes.svg)


実際の運用では、コマンド一発よりも YAML で管理することが多いため、Manifest を使ってデプロイします。

## 22-1. deployment.yaml を作成する

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

## 22-2. デプロイする

```bash
kubectl apply -f deployment.yaml
```

実行結果例:

```bash
deployment.apps/my-httpd created
service/my-httpd created
```

確認します。

```bash
kubectl get deployments
kubectl get pods
kubectl get svc
```

実行結果例:

```bash
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-httpd   1/1     1            1           20s

NAME                        READY   STATUS    RESTARTS   AGE
my-httpd-7d7f85f8f9-zx2cl   1/1     Running   0          19s

NAME         TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
my-httpd     NodePort   10.43.130.41    <none>        80:30080/TCP   20s
kubernetes   ClusterIP  10.43.0.1       <none>        443/TCP        1d
```

アクセス確認:

```bash
curl http://localhost:30080
```

## 22-3. 削除する

```bash
kubectl delete -f deployment.yaml
```
