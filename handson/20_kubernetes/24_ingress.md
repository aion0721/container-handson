# 24. Ingress で名前ベースに公開する

![ページのイメージ図](/illustrations/kubernetes.svg)


## この章でやること

前の章では、Service を使って `http://localhost:30083` のようにポート番号でアクセスしました。
この章では、その Service に対して Ingress を追加し、`http://my-httpd.localhost` のように名前ベースでアクセスします。

```text
Service: http://localhost:30083 のようにポート番号でアクセスする
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
Service（my-httpd）
  ↓
Pod
```

::: tip
この章は、前の章で作成した `my-httpd` Service が残っている前提で進めます。
:::

## 24-1. ingress.yaml を作成する

Ingress の Manifest ファイルを作成します。

```bash
cat <<'EOF' > ingress.yaml
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

Ingress のポイントは次の部分です。

```yaml
rules:
  - host: my-httpd.localhost
    http:
      paths:
        - backend:
            service:
              name: my-httpd
              port:
                number: 80
```

この `host` によって、`my-httpd.localhost` で来た HTTP アクセスを `my-httpd` Service に流します。

## 24-2. Ingress を追加する

```bash
kubectl apply -f ingress.yaml
```

実行結果例:

```bash
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
pod/my-httpd-7d7f85f8f9-bz9mp   1/1     Running   0          12m
pod/my-httpd-7d7f85f8f9-k8m2n   1/1     Running   0          8m
pod/my-httpd-7d7f85f8f9-xn4td   1/1     Running   0          9m

NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
service/my-httpd     NodePort    10.43.130.41    <none>        80:30083/TCP   4m
service/kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP        1d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/my-httpd   3/3     3            3           12m

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/my-httpd-7d7f85f8f9   3         3         3       12m

NAME       CLASS    HOSTS                ADDRESS        PORTS   AGE
my-httpd   <none>   my-httpd.localhost   192.168.0.10   80      30s
```

## 24-3. 名前でアクセスする

ローカル環境で `my-httpd.localhost` が名前解決できる場合は、次のようにアクセスできます。

```bash
curl http://my-httpd.localhost
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

ここでは `http://localhost:30083` のようなアプリ用の `NodePort` は指定していません。
Ingress が `my-httpd.localhost` という名前を見て、`my-httpd` Service へルーティングしています。

SSH 接続先の Linux サーバー上で作業している場合など、手元の端末から `my-httpd.localhost` でアクセスできないときは、Node の IP アドレスと `Host` ヘッダーを使って確認します。

```bash
kubectl get nodes -o wide
```

表示された `INTERNAL-IP` を使って、`Host` ヘッダーに `my-httpd.localhost` を指定します。

```bash
curl -H "Host: my-httpd.localhost" http://<Node の INTERNAL-IP>
```

## 24-4. 発展: nip.io で名前解決する

`my-httpd.localhost` はローカル環境では便利ですが、SSH 接続先の Linux サーバーや共有サーバーでは、手元のブラウザからそのまま名前解決できないことがあります。
そのようなときは、`nip.io` のようなワイルドカード DNS サービスを使うと、`/etc/hosts` を編集せずに名前ベースのアクセスを試せます。

`nip.io` は、ホスト名に含まれる IP アドレスへ名前解決してくれるサービスです。
たとえば、`my-httpd.192.168.0.10.nip.io` は `192.168.0.10` に解決されます。

まず k3s の Node の IP アドレスを確認します。

```bash
kubectl get nodes -o wide
```

表示された `INTERNAL-IP` が `192.168.0.10` だった場合、Ingress の `host` を次のように変更します。

```yaml
rules:
  - host: my-httpd.192.168.0.10.nip.io
```

`ingress.yaml` を編集したら、再度 `apply` します。

```bash
kubectl apply -f ingress.yaml
```

名前ベースでアクセスします。

```bash
curl http://my-httpd.192.168.0.10.nip.io
```

ブラウザからも `http://my-httpd.192.168.0.10.nip.io` のような URL で確認できます。

::: warning
`nip.io` は外部の DNS サービスです。
ネットワーク環境によっては、プライベート IP アドレスへの名前解決が DNS Rebinding Protection によってブロックされる場合があります。
その場合は、`Host` ヘッダーを指定する方法や `/etc/hosts` を使う方法で確認してください。
:::

参考: [nip.io](https://nip.io/)

## 24-5. ルーティングを確認する

Ingress の詳細を確認します。

```bash
kubectl describe ingress my-httpd
```

確認するポイント:

- `Host` が `my-httpd.localhost`、または発展手順で設定した `my-httpd.<Node IP>.nip.io` になっていること
- `Backend` が `my-httpd:80` になっていること
- `Rules` に `/` のルーティングがあること

Pod、Service、Ingress の関係を改めて確認します。

```bash
kubectl get pods -l app=my-httpd
kubectl get endpoints my-httpd
kubectl get ingress my-httpd
```

`endpoints` には、Service の接続先になっている Pod の IP アドレスが表示されます。

::: tip
ここまでで作った `my-httpd.yaml`、`service.yaml`、`ingress.yaml` は、Deployment、Service、Ingress を分けて管理する Manifest です。
実際の運用でも、役割ごとに Manifest を分けておくと変更しやすくなります。
:::
