# 13. コンテナイメージをビルドして修正する

![ページのイメージ図](/illustrations/podman.svg)


ここからは、`httpd` をベースに独自の Web ページを表示するイメージを作ります。

## 13-1. 作業ディレクトリを作成する

```bash
mkdir podman-httpd-handson
cd podman-httpd-handson
```

## 13-2. HTML ファイルを作成する

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

## 13-3. Containerfile を作成する

`Containerfile` を作成します。

```dockerfile
FROM docker.io/library/httpd:2.4

COPY index.html /usr/local/apache2/htdocs/index.html
```

## 13-4. イメージをビルドする

```bash
podman build -t my-httpd:v1 .
```

ビルド後、一覧を確認します。

```bash
podman images
```

## 13-5. ビルドしたイメージを起動する

```bash
podman run -d --name my-httpd-v1 -p 8080:80 my-httpd:v1
```

表示確認:

```bash
curl http://localhost:8080
```

`Hello Podman!` が表示されれば成功です。

## 13-6. ページを修正する

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
