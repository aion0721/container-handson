# 10. Podman 編

この章では、`podman` を使った基本操作を実施します。

# 1. コンテナイメージの取得と削除

まずは、コンテナイメージを取得してみます。

## 1-1. イメージを取得する

以下のコマンドで `httpd` イメージを取得します。

```bash
podman pull docker.io/library/httpd:2.4
```

取得できたら、ローカルに存在するイメージ一覧を確認します。

```bash
podman images
```

出力例:

```bash
REPOSITORY                 TAG      IMAGE ID      CREATED      SIZE
docker.io/library/httpd    2.4      xxxxxxxxxxxx  x days ago   xxx MB
```

## 1-2. イメージの詳細を確認する

```bash
podman image inspect docker.io/library/httpd:2.4
```

イメージのメタデータや設定内容を確認できます。

## 1-3. イメージを削除する

不要になったイメージは削除できます。

```bash
podman rmi docker.io/library/httpd:2.4
```

削除後、再度一覧を確認してみましょう。

```bash
podman images
```

::: warning
そのイメージを利用中のコンテナが存在する場合、イメージ削除に失敗することがあります。
その場合は先にコンテナを削除してください。
:::

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

# 3. コンテナイメージをビルドして修正する

ここからは、`httpd` をベースに独自の Web ページを表示するイメージを作ります。

## 3-1. 作業ディレクトリを作成する

```bash
mkdir podman-httpd-handson
cd podman-httpd-handson
```

## 3-2. HTML ファイルを作成する

`index.html` を作成します。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Podman Hands-on</title>
  </head>
  <body>
    <h1>Hello Podman!</h1>
    <p>このページは独自にビルドしたコンテナイメージで動いています。</p>
  </body>
</html>
```

## 3-3. Containerfile を作成する

`Containerfile` を作成します。

```dockerfile
FROM docker.io/library/httpd:2.4

COPY index.html /usr/local/apache2/htdocs/index.html
```

## 3-4. イメージをビルドする

```bash
podman build -t my-httpd:v1 .
```

ビルド後、一覧を確認します。

```bash
podman images
```

## 3-5. ビルドしたイメージを起動する

```bash
podman run -d --name my-httpd-v1 -p 8080:80 my-httpd:v1
```

表示確認:

```bash
curl http://localhost:8080
```

`Hello Podman!` が表示されれば成功です。

## 3-6. ページを修正する

`index.html` を編集してみます。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>Podman Hands-on</title>
  </head>
  <body>
    <h1>Hello Podman v2!</h1>
    <p>コンテナイメージを修正して再ビルドしました。</p>
    <p>この変更は新しいイメージとして反映されます。</p>
  </body>
</html>
```

コンテナを停止・削除します。

```bash
podman stop my-httpd-v1
podman rm my-httpd-v1
```

再ビルドします。

```bash
podman build -t my-httpd:v2 .
```

再度起動します。

```bash
podman run -d --name my-httpd-v2 -p 8080:80 my-httpd:v2
```

確認します。

```bash
curl http://localhost:8080
```

表示が `Hello Podman v2!` に変わっていれば、修正と再ビルドが成功しています。
