# 24. クラスターのメリットを体験する

![ページのイメージ図](/illustrations/kubernetes.svg)


Kubernetes クラスターを使うと、アプリをただ起動するだけでなく、安定して運用しやすくなります。

この章では、次の 3 つを体験します。

1. Pod を複数に増やしてスケールする
2. Pod を削除しても自然復旧する
3. イメージを更新してローリングアップデートする

## 24-1. cluster-demo.yaml を作成する

`cluster-demo.yaml` を作成します。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: cluster-demo
  template:
    metadata:
      labels:
        app: cluster-demo
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
  name: cluster-demo
spec:
  selector:
    app: cluster-demo
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30084
  type: NodePort
```

## 24-2. デプロイする

```bash
kubectl apply -f cluster-demo.yaml
```

実行結果例:

```bash
deployment.apps/cluster-demo created
service/cluster-demo created
```

状態を確認します。

```bash
kubectl get deployments
kubectl get pods -l app=cluster-demo
kubectl get svc cluster-demo
```

実行結果例:

```bash
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
cluster-demo   2/2     2            2           20s

NAME                            READY   STATUS    RESTARTS   AGE
cluster-demo-7d7f85f8f9-2m8kt   1/1     Running   0          19s
cluster-demo-7d7f85f8f9-qz6fp   1/1     Running   0          19s

NAME           TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
cluster-demo   NodePort   10.43.222.100   <none>        80:30084/TCP   20s
```

アクセス確認:

```bash
curl http://localhost:30084
```

## 24-3. スケールする

Pod の数を 2 個から 4 個に増やします。

```bash
kubectl scale deployment cluster-demo --replicas=4
```

確認します。

```bash
kubectl get deployment cluster-demo
kubectl get pods -l app=cluster-demo
```

実行結果例:

```bash
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
cluster-demo   4/4     4            4           2m

NAME                            READY   STATUS    RESTARTS   AGE
cluster-demo-7d7f85f8f9-2m8kt   1/1     Running   0          2m
cluster-demo-7d7f85f8f9-qz6fp   1/1     Running   0          2m
cluster-demo-7d7f85f8f9-t6x7b   1/1     Running   0          15s
cluster-demo-7d7f85f8f9-z9k4p   1/1     Running   0          15s
```

::: tip
Pod の数を増やすことで、アクセスを複数の Pod に分散しやすくなります。
これがクラスターのスケールしやすさです。
:::

## 24-4. Pod を削除して自然復旧を確認する

Pod を 1 つ削除します。

```bash
kubectl delete pod cluster-demo-7d7f85f8f9-2m8kt
```

::: tip
Pod 名は環境ごとに異なります。
`kubectl get pods -l app=cluster-demo` の結果に表示された名前に置き換えてください。
:::

もう一度確認します。

```bash
kubectl get pods -l app=cluster-demo
```

実行結果例:

```bash
NAME                            READY   STATUS    RESTARTS   AGE
cluster-demo-7d7f85f8f9-qz6fp   1/1     Running   0          3m
cluster-demo-7d7f85f8f9-t6x7b   1/1     Running   0          1m
cluster-demo-7d7f85f8f9-z9k4p   1/1     Running   0          1m
cluster-demo-7d7f85f8f9-w4n8d   1/1     Running   0          10s
```

削除した Pod とは別の名前で、新しい Pod が作成されていれば成功です。
Deployment が `replicas: 4` の状態を保つために、自動で Pod を作り直しています。

## 24-5. ローリングアップデートする

コンテナイメージを更新します。
ここでは `httpd:2.4` から `httpd:2.4.58` に変更します。

```bash
kubectl set image deployment/cluster-demo httpd=docker.io/library/httpd:2.4.58
```

更新状況を確認します。

```bash
kubectl rollout status deployment/cluster-demo
```

実行結果例:

```bash
deployment "cluster-demo" successfully rolled out
```

Deployment の履歴を確認します。

```bash
kubectl rollout history deployment/cluster-demo
```

実行結果例:

```bash
deployment.apps/cluster-demo
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

::: tip
ローリングアップデートでは、Pod を少しずつ入れ替えます。
これにより、アプリを止めずに新しいバージョンへ更新しやすくなります。
:::

## 24-6. 元に戻す

問題があった場合は、直前の状態に戻せます。

```bash
kubectl rollout undo deployment/cluster-demo
```

戻ったことを確認します。

```bash
kubectl rollout status deployment/cluster-demo
kubectl get pods -l app=cluster-demo
```

## 24-7. 削除する

```bash
kubectl delete -f cluster-demo.yaml
```
