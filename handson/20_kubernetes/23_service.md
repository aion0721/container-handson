# 23. Service で公開する

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

前の章では、`my-httpd` Deployment を作成しました。
この章では、その Deployment が作った Pod に対して `Service` を追加します。

Service は、Pod への安定した入口を作るためのリソースです。
Pod は作り直されると名前や IP アドレスが変わりますが、Service を使うと同じ入口からアクセスできます。

この章では、次の 2 つを確認します。

1. `NodePort` でポート番号を指定してアクセスする
2. `port-forward` で手元のブラウザからアクセスする

```text
ブラウザ / curl
  ↓
Service（app: my-httpd の Pod へ接続）
  ↓
Pod
```

::: tip
この章は、前の章で作成した `my-httpd` Deployment が残っている前提で進めます。
:::

## 23-1. service.yaml を作成する

Service の Manifest ファイルを作成します。

```bash
cat <<'EOF' > service.yaml
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
EOF
```

Service のポイントは次の部分です。

```yaml
selector:
  app: my-httpd
ports:
  - port: 80
    targetPort: 80
    nodePort: 30083
type: NodePort
```

`selector` が `app: my-httpd` になっているため、前の章で作った Deployment の Pod に接続されます。

- `port`: Service が受けるポート
- `targetPort`: Pod 側のポート
- `nodePort`: クラスター外からアクセスするときのポート

## 23-2. Service を追加する

::: warning
この章では分かりやすさのために `nodePort: 30083` を固定しています。
同じクラスターを複数人で共有する場合は、受講者ごとに Namespace や NodePort を分けてください。
:::

```bash
kubectl apply -f service.yaml
```

実行結果例:

```bash
service/my-httpd created
```

作成されたリソースを確認します。

```bash
kubectl get all
```

実行結果例:

```bash
NAME                            READY   STATUS    RESTARTS   AGE
pod/my-httpd-7d7f85f8f9-bz9mp   1/1     Running   0          8m
pod/my-httpd-7d7f85f8f9-k8m2n   1/1     Running   0          4m
pod/my-httpd-7d7f85f8f9-xn4td   1/1     Running   0          5m

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/my-httpd     NodePort    10.43.130.41    <none>        80:30083/TCP   30s
service/kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-httpd   3/3     3            3           8m

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-httpd-7d7f85f8f9   3         3         3       8m
```

## 23-3. NodePort でアクセスする

Service はポート番号を使ってアクセスします。
ここでは、ホスト側から `nodePort: 30083` にアクセスします。

```bash
curl http://localhost:30083
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

::: tip
SSH 接続先の Linux サーバー上で k3s を動かしている場合は、`localhost` はその Linux サーバー自身を指します。
WSL 上で作業している場合は、次の `port-forward` を使うと Windows のブラウザから確認しやすくなります。
:::

## 23-4. port-forward で手元のブラウザから確認する

`kubectl port-forward` を使うと、コマンドを実行している環境のポートを Kubernetes の Service につなげられます。
Windows で WSL を使っている場合や、ブラウザで確認したい場合に便利です。

次のコマンドを実行します。

```bash
kubectl port-forward service/my-httpd 8080:80
```

実行中は、ターミナルが待ち受け状態になります。

```bash
Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80
```

別のターミナル、または Windows のブラウザから次の URL を開きます。

```text
http://localhost:8080
```

`It works!` が表示されれば成功です。

確認が終わったら、`port-forward` を実行しているターミナルで `Ctrl+C` を押して停止します。

::: tip
SSH 接続先の Linux サーバー上で `kubectl port-forward` を実行した場合、`localhost:8080` はその SSH 接続先の Linux サーバー側に開きます。
手元の Windows ブラウザから開きたい場合は、SSH のローカルポートフォワーディングなどを組み合わせてください。
:::

::: tip
`port-forward` は検証やデバッグに便利な方法です。
本番環境で外部公開する方法というより、手元から一時的に確認するための方法として使います。
:::

::: tip
この章で作った `my-httpd` Service は、次の章で Ingress から参照します。
ここでは削除せず、そのまま残して進めてください。
:::
