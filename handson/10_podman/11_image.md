# 11. コンテナイメージの取得と削除

![ページのイメージ図](/illustrations/podman.svg)


まずは、コンテナイメージを取得してみます。

## 11-1. イメージを取得する

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

## 11-2. イメージの詳細を確認する

```bash
podman image inspect docker.io/library/httpd:2.4
```

イメージのメタデータや設定内容を確認できます。

## 11-3. イメージを削除する

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
