# 2. コンテナの起動・停止・削除

次は、取得したイメージを使ってコンテナを動かします。

## 2-1. コンテナを起動する

再度イメージを取得します。

```bash
podman pull docker.io/library/httpd:2.4
```

`8080` 番ポートで公開して起動します。

```bash
podman run -d --name my-httpd -p 8080:80 docker.io/library/httpd:2.4
```

オプションの意味は以下の通りです。

- `-d`: バックグラウンド起動
- `--name my-httpd`: コンテナ名を指定
- `-p 8080:80`: ホストの 8080 番をコンテナの 80 番に転送

## 2-2. 起動中のコンテナを確認する

```bash
podman ps
```

ブラウザまたは `curl` でアクセスしてみます。

```bash
curl http://localhost:8080
```

Apache HTTP Server の初期ページが返ってくれば成功です。

## 2-3. コンテナを停止する

```bash
podman stop my-httpd
```

停止後、起動中コンテナ一覧から消えたことを確認します。

```bash
podman ps
```

停止済みコンテナも含めて確認する場合は以下です。

```bash
podman ps -a
```

## 2-4. コンテナを再起動する

```bash
podman start my-httpd
```

再度アクセス確認してみましょう。

```bash
curl http://localhost:8080
```

## 2-5. コンテナを削除する

まず停止します。

```bash
podman stop my-httpd
```

その後、削除します。

```bash
podman rm my-httpd
```

確認します。

```bash
podman ps -a
```
