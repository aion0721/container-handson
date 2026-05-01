# 25. クラスターのメリットを体験する

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

![クラスターのメリットを確認する流れ](/flows/25_merit.svg)

Kubernetes クラスターを使うと、アプリをただ起動するだけでなく、安定して運用しやすくなります。

この章では、次の 3 つを体験します。

1. Pod を複数に増やしてスケールする
2. Pod を削除しても自然復旧する
3. イメージを更新してローリングアップデートする

## 25-1. cluster-demo.yaml を作成する

`cluster-demo.yaml` を作成します。

```bash
cat <<'EOF' > cluster-demo.yaml
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
          command: ["sh", "-c"]
          args:
            - echo "<h1>Cluster demo ${APP_VERSION}</h1>" > /usr/local/apache2/htdocs/index.html && httpd-foreground
          env:
            - name: APP_VERSION
              value: v1
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
EOF
```

作成する内容は次の通りです。

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
          command: ["sh", "-c"]
          args:
            - echo "<h1>Cluster demo ${APP_VERSION}</h1>" > /usr/local/apache2/htdocs/index.html && httpd-foreground
          env:
            - name: APP_VERSION
              value: v1
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

## 25-2. デプロイする

::: warning
この章では分かりやすさのために `nodePort: 30084` を固定しています。
同じクラスターを複数人で共有する場合は、受講者ごとに Namespace や NodePort を分けてください。
:::

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
kubectl get all
```

実行結果例:

```bash
NAME                                READY   STATUS    RESTARTS   AGE
pod/cluster-demo-7d7f85f8f9-2m8kt   1/1     Running   0          19s
pod/cluster-demo-7d7f85f8f9-qz6fp   1/1     Running   0          19s

NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/cluster-demo   NodePort    10.43.222.100   <none>        80:30084/TCP   20s
service/kubernetes     ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cluster-demo   2/2     2            2           20s

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/cluster-demo-7d7f85f8f9   2         2         2       20s
```

アクセス確認:

```bash
curl http://localhost:30084
```

`Cluster demo v1` が表示されれば成功です。

## 25-3. スケールする

Pod の数を 2 個から 4 個に増やします。

```bash
kubectl scale deployment cluster-demo --replicas=4
```

確認します。

```bash
kubectl get all
```

実行結果例:

```bash
NAME                                READY   STATUS    RESTARTS   AGE
pod/cluster-demo-7d7f85f8f9-2m8kt   1/1     Running   0          2m
pod/cluster-demo-7d7f85f8f9-qz6fp   1/1     Running   0          2m
pod/cluster-demo-7d7f85f8f9-t6x7b   1/1     Running   0          15s
pod/cluster-demo-7d7f85f8f9-z9k4p   1/1     Running   0          15s

NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/cluster-demo   NodePort    10.43.222.100   <none>        80:30084/TCP   2m
service/kubernetes     ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cluster-demo   4/4     4            4           2m

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/cluster-demo-7d7f85f8f9   4         4         4       2m
```

::: tip
Pod の数を増やすことで、アクセスを複数の Pod に分散しやすくなります。
これがクラスターのスケールしやすさです。
:::

## 25-4. Pod を削除して自然復旧を確認する

Pod を 1 つ削除します。

```bash
kubectl delete pod cluster-demo-7d7f85f8f9-2m8kt
```

::: tip
Pod 名は環境ごとに異なります。
`kubectl get all` の `pod/cluster-demo-...` に表示された名前に置き換えてください。
`kubectl delete pod` では、先頭の `pod/` は付けずに指定します。
:::

もう一度確認します。

```bash
kubectl get all
```

実行結果例:

```bash
NAME                                READY   STATUS    RESTARTS   AGE
pod/cluster-demo-7d7f85f8f9-qz6fp   1/1     Running   0          3m
pod/cluster-demo-7d7f85f8f9-t6x7b   1/1     Running   0          1m
pod/cluster-demo-7d7f85f8f9-z9k4p   1/1     Running   0          1m
pod/cluster-demo-7d7f85f8f9-w4n8d   1/1     Running   0          10s

NAME                   TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/cluster-demo   NodePort    10.43.222.100   <none>        80:30084/TCP   3m
service/kubernetes     ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/cluster-demo   4/4     4            4           3m

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/cluster-demo-7d7f85f8f9   4         4         4       3m
```

削除した Pod とは別の名前で、新しい Pod が作成されていれば成功です。
Deployment が `replicas: 4` の状態を保つために、自動で Pod を作り直しています。

## 25-5. ローリングアップデートする

アプリの表示バージョンを `v1` から `v2` に更新します。
ここでは環境変数を変更して、Deployment が Pod を少しずつ入れ替える様子を確認します。

```bash
kubectl set env deployment/cluster-demo APP_VERSION=v2
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

アクセスし直して、表示が変わったことを確認します。

```bash
curl http://localhost:30084
```

`Cluster demo v2` が表示されれば、ローリングアップデートが成功しています。

::: tip
ローリングアップデートでは、Pod を少しずつ入れ替えます。
これにより、アプリを止めずに新しいバージョンへ更新しやすくなります。
:::

## 25-6. 元に戻す

問題があった場合は、直前の状態に戻せます。

```bash
kubectl rollout undo deployment/cluster-demo
```

戻ったことを確認します。

```bash
kubectl rollout status deployment/cluster-demo
kubectl get all
```

もう一度アクセスし、表示が `Cluster demo v1` に戻っていることを確認します。

```bash
curl http://localhost:30084
```

## 25-7. 削除する

```bash
kubectl delete -f cluster-demo.yaml
```
