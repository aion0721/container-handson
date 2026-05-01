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

## 22-3. Pod を削除して自然復旧を確認する

Deployment は、指定した数の Pod が動き続けるように管理します。
試しに Pod を 1 つ削除して、自然に復旧することを確認します。

まず Pod 名を確認します。

```bash
kubectl get pods
```

実行結果例:

```bash
NAME                        READY   STATUS    RESTARTS   AGE
my-httpd-7d7f85f8f9-zx2cl   1/1     Running   0          2m
```

Pod を削除します。

```bash
kubectl delete pod my-httpd-7d7f85f8f9-zx2cl
```

::: tip
Pod 名は環境ごとに異なります。
`kubectl get pods` の結果に表示された名前に置き換えてください。
:::

もう一度 Pod の状態を確認します。

```bash
kubectl get pods
```

実行結果例:

```bash
NAME                        READY   STATUS    RESTARTS   AGE
my-httpd-7d7f85f8f9-k8m2n   1/1     Running   0          12s
```

削除した Pod とは別の名前で、新しい Pod が作成されていれば成功です。
Deployment が `replicas: 1` の状態を保つために、自動で Pod を作り直しています。

::: info
Pod を直接作成しただけの場合は、このような自動復旧は行われません。
Deployment が Pod の数を管理しているため、削除されても再作成されます。
:::

## 22-4. 削除する

```bash
kubectl delete -f deployment.yaml
```
