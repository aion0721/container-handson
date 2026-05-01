# 12. コンテナの起動・停止・削除

![ページのイメージ図](/illustrations/podman.svg)


次は、取得したイメージを使ってコンテナを動かします。

## 12-1. コンテナを起動する

再度イメージを取得します。

```bash
podman pull docker.io/library/httpd:2.4
```

`8080` 番ポートで公開して起動します。

```bash
podman run -d --name my-httpd -p 8080:80 docker.io/library/httpd:2.4
```

実行結果例:

```bash
3f3de8e2fb38f95e35f6c4fb4d4f7f4d0f0a0b8f8f2c1db92d761e33f6c12abc
```

オプションの意味は次の通りです。

- `-d`: バックグラウンド起動
- `--name my-httpd`: コンテナ名を指定
- `-p 8080:80`: ホストの 8080 番をコンテナの 80 番に転送

## 12-2. 起動中のコンテナを確認する

```bash
podman ps
```

実行結果例:

```bash
CONTAINER ID  IMAGE                            COMMAND           CREATED         STATUS         PORTS                 NAMES
3f3de8e2fb38  docker.io/library/httpd:2.4      httpd-foreground  10 seconds ago  Up 10 seconds  0.0.0.0:8080->80/tcp  my-httpd
```

ブラウザまたは `curl` でアクセスしてみます。

```bash
curl http://localhost:8080
```

実行結果例:

```html
<html><body><h1>It works!</h1></body></html>
```

Apache HTTP Server の初期ページが返ってくれば成功です。

## 12-3. コンテナを停止する

```bash
podman stop my-httpd
```

停止後、起動中コンテナ一覧から消えたことを確認します。

```bash
podman ps
```

停止済みコンテナも含めて確認する場合は、次のコマンドを使います。

```bash
podman ps -a
```

## 12-4. コンテナを再起動する

```bash
podman start my-httpd
```

再度アクセス確認してみましょう。

```bash
curl http://localhost:8080
```

## 12-5. コンテナを削除する

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
