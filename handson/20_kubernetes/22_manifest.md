# 22. Manifest でデプロイする

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

![Manifest デプロイの流れ](/flows/22_manifest.svg)

実際の運用では、コマンド一発よりも YAML で管理することが多いため、Manifest を使ってデプロイします。

## 22-1. my-httpd.yaml を作成する

`Deployment` と `Service` を 1 つの Manifest ファイルにまとめます。

```bash
cat <<'EOF' > my-httpd.yaml
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
EOF
```

作成する内容は次の通りです。

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

::: warning
この章では分かりやすさのために `nodePort: 30080` を固定しています。
同じクラスターを複数人で共有する場合は、受講者ごとに Namespace や NodePort を分けてください。
:::

```bash
kubectl apply -f my-httpd.yaml
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

## 22-3. replicas を変更して再 apply する

Manifest は「実行する手順」ではなく、「こうなっていてほしい状態」を書くファイルです。
そのことを確認するために、`replicas` の数を変更して、もう一度 `apply` してみます。

まず、`my-httpd.yaml` の `replicas` を `1` から `3` に変更します。

```bash
sed -i 's/replicas: 1/replicas: 3/' my-httpd.yaml
```

変更した Manifest を再度反映します。

```bash
kubectl apply -f my-httpd.yaml
```

実行結果例:

```bash
deployment.apps/my-httpd configured
service/my-httpd unchanged
```

Pod の数を確認します。

```bash
kubectl get deployments
kubectl get replicasets
kubectl get pods
```

実行結果例:

```bash
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
my-httpd   3/3     3            3           3m

NAME                  DESIRED   CURRENT   READY   AGE
my-httpd-7d7f85f8f9   3         3         3       3m

NAME                        READY   STATUS    RESTARTS   AGE
my-httpd-7d7f85f8f9-2qk6l   1/1     Running   0          18s
my-httpd-7d7f85f8f9-bz9mp   1/1     Running   0          3m
my-httpd-7d7f85f8f9-xn4td   1/1     Running   0          18s
```

`replicas: 3` と書いた状態に近づけるために、Kubernetes が Pod を 3 つに増やしています。
このように、Manifest を変更して `apply` すると、現在の状態が Manifest に書いた状態へ更新されます。

このあとの手順では Pod が 1 つの状態で進めるため、`replicas` を `1` に戻します。

```bash
sed -i 's/replicas: 3/replicas: 1/' my-httpd.yaml
kubectl apply -f my-httpd.yaml
```

Pod が 1 つに戻ったことを確認します。

```bash
kubectl get deployments
kubectl get pods
```

## 22-4. Pod を削除して自然復旧を確認する

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

## 22-5. 命令的・宣言的と冪等性

ここまでで、`kubectl apply -f my-httpd.yaml` を使って Deployment と Service を作成しました。
この操作には、Kubernetes を扱う上で重要な考え方が含まれています。

### 命令的な操作

命令的な操作は、「今この操作を実行して」と Kubernetes に指示する方法です。

例:

```bash
kubectl run httpd --image=docker.io/library/httpd:2.4 --port=80
kubectl expose pod httpd --type=NodePort --port=80
```

これは手早く試すには便利ですが、あとから「どの設定で作ったか」を確認しづらくなりがちです。

### 宣言的な操作

宣言的な操作は、「こういう状態にしたい」と Manifest に書き、その状態を Kubernetes に反映する方法です。

例:

```bash
kubectl apply -f my-httpd.yaml
```

Manifest を使うと、設定内容がファイルとして残ります。
そのため、あとから見直したり、チームで共有したり、Git で変更履歴を管理したりしやすくなります。

### 冪等性

冪等性（べきとうせい）とは、同じ操作を何度実行しても結果が同じになる性質です。

たとえば、リソースがすでに Manifest と同じ状態になっているときに、もう一度 `apply` を実行したとします。

```bash
kubectl apply -f my-httpd.yaml
```

その場合、実行結果は次のようになります。

```bash
deployment.apps/my-httpd unchanged
service/my-httpd unchanged
```

すでに Manifest と同じ状態になっているため、余計に Pod や Service が増えるわけではありません。
一方、Manifest の内容を変更してから `apply` すると、Kubernetes は現在の状態を Manifest に書かれた状態へ近づけます。

このように Manifest は、単なる手順書ではなく **「あるべき状態」を管理するファイル** として扱えます。

## 22-6. 削除する

```bash
kubectl delete -f my-httpd.yaml
```
