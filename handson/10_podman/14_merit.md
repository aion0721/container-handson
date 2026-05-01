# 14. コンテナのメリットを体験する

![ページのイメージ図](/illustrations/podman.svg)

## この章でやること

![コンテナのメリットを確認する流れ](/flows/14_merit.svg)

ここまでで、コンテナイメージの取得、コンテナの起動、イメージのビルドを体験しました。

この章では、コンテナのメリットをコマンドで確認します。

1. 同じイメージから同じ環境を再現できる
2. コンテナごとに変更を分離できる
3. 壊しても作り直しやすい
4. イメージとして配布しやすい

## 14-1. 同じイメージから複数のコンテナを起動する

同じ `httpd` イメージから、2 つのコンテナを起動します。

```bash
podman run -d --name merit-httpd-1 -p 8081:80 docker.io/library/httpd:2.4
podman run -d --name merit-httpd-2 -p 8082:80 docker.io/library/httpd:2.4
```

起動状態を確認します。

```bash
podman ps
```

アクセス確認:

```bash
curl http://localhost:8081
curl http://localhost:8082
```

どちらも同じ Apache HTTP Server の初期ページが返ってくれば成功です。

::: tip
同じイメージを使うことで、同じ実行環境を何度でも作れます。
これがコンテナの再現性です。
:::

## 14-2. 片方のコンテナだけ変更する

`merit-httpd-1` の中だけを変更します。

```bash
podman exec merit-httpd-1 sh -c 'echo "<h1>Changed container 1</h1>" > /usr/local/apache2/htdocs/index.html'
```

それぞれにアクセスします。

```bash
curl http://localhost:8081
curl http://localhost:8082
```

実行結果例:

```html
<h1>Changed container 1</h1>
```

```html
<html><body><h1>It works!</h1></body></html>
```

`merit-httpd-1` だけ表示が変わり、`merit-httpd-2` は変わっていなければ成功です。

::: tip
コンテナごとにファイルシステムが分離されているため、片方の変更がもう片方へ直接影響しません。
:::

## 14-3. 壊しても作り直す

変更した `merit-httpd-1` を削除します。

```bash
podman rm -f merit-httpd-1
```

同じ名前とポートで、もう一度起動します。

```bash
podman run -d --name merit-httpd-1 -p 8081:80 docker.io/library/httpd:2.4
```

確認します。

```bash
curl http://localhost:8081
```

Apache HTTP Server の初期ページに戻っていれば成功です。

::: tip
コンテナは削除しても、イメージが残っていればすぐに作り直せます。
これがコンテナの使い捨てやすさです。
:::

## 14-4. イメージとして保存する

イメージにタグを付けます。

```bash
podman tag docker.io/library/httpd:2.4 merit-httpd:v1
```

イメージをファイルとして保存します。

```bash
podman save -o merit-httpd-v1.tar merit-httpd:v1
```

ファイルが作成されたことを確認します。

```bash
ls -lh merit-httpd-v1.tar
```

::: tip
保存したイメージファイルは、別の環境へコピーして `podman load` で読み込めます。
レジストリを使う場合も、イメージを push / pull して同じように配布できます。
:::

## 14-5. 後片付け

コンテナを削除します。

```bash
podman rm -f merit-httpd-1 merit-httpd-2
```

作成したタグを削除します。

```bash
podman rmi merit-httpd:v1
```

作成したイメージファイルが不要な場合は削除します。

```bash
rm merit-httpd-v1.tar
```
