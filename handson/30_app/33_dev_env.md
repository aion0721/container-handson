# 33. コンテナを開発環境として利用する

![ページのイメージ図](/illustrations/apps.svg)


ローカル環境の差異を減らすために、コンテナを「開発環境」として使うパターンを紹介します。

## この章で達成したいこと

アプリを動かすためだけでなく、開発に使う Java やツールもコンテナにまとめます。

これができると、次のようなことにつながります。

- メンバーごとの Java バージョンやツール差分を減らせる
- 新しい PC でも、コンテナを起動すればすぐ開発を始めやすい
- ハッカソンで「自分の環境では動くのに」を減らしやすい

この章では、ホストのソースコードをコンテナにマウントし、コンテナ内でビルドや実行を行います。

## 33-1. 開発用 Containerfile を作る

```dockerfile
FROM eclipse-temurin:21-jdk

WORKDIR /workspace
RUN microdnf install -y git && microdnf clean all

CMD ["bash"]
```

::: tip
Node.js や Python を使う場合は、ベースイメージを `node:20` や `python:3.12` に置き換えてください。
:::

## 33-2. ソースをマウントして起動する

```bash
podman build -t dev-env:java .
podman run --rm -it \
  -v $(pwd):/workspace \
  -w /workspace \
  dev-env:java
```

これでホスト側のソースを使いながら、コンテナ内でビルド・実行できます。

## 33-3. よく使う開発コマンド

```bash
./mvnw -v
./mvnw test
./mvnw spring-boot:run
```

## 33-4. k3s と組み合わせるときの流れ

1. コンテナ内でビルドして成果物を作る
2. `podman build` で実行用イメージを作る
3. レジストリへプッシュする
4. `kubectl apply` で反映する

この流れをチームで揃えると、環境差異による不具合を減らせます。
