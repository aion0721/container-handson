# 32. Java のアプリをコンテナで動かす

![ページのイメージ図](/illustrations/apps.svg)


ここでは、Spring Boot を例に Java アプリをコンテナ化して `k3s` にデプロイします。

## この章で達成したいこと

Java アプリを JAR としてビルドし、その JAR を実行するコンテナイメージを作ります。
そして、そのイメージを Kubernetes にデプロイします。

これができると、次のようなことにつながります。

- 自分が作った Spring Boot アプリを、実行環境ごとコンテナにまとめられる
- Java やライブラリの実行環境を、チームやデプロイ先で揃えやすくなる
- ハッカソンで作った API サーバを、`k3s` 上で動かすイメージが持てる

この章のポイントは、`JAR を作る -> JAR を実行するイメージを作る -> Kubernetes にデプロイする` という流れです。

## 32-1. サンプルアプリを用意する

以下のような最小構成の Spring Boot アプリを想定します。

```java
@RestController
public class HelloController {
  @GetMapping("/")
  public String hello() {
    return "Hello Java on k3s!";
  }
}
```

## 32-2. JAR をビルドする

Maven を使う場合の例です。

```bash
./mvnw clean package
```

ビルド後、`target/*.jar` が生成されていることを確認します。

## 32-3. Containerfile を作成する

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app
COPY target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

作成する場合は、次のコマンドを使えます。

```bash
cat <<'EOF' > Containerfile
FROM eclipse-temurin:21-jre

WORKDIR /app
COPY target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
EOF
```

## 32-4. イメージをビルドしてプッシュする

k3s から参照できるレジストリにプッシュしてください。
ここでは例として `registry.example.local` を利用します。

```bash
podman build -t java-sample:v1 .
podman tag java-sample:v1 registry.example.local/java-sample:v1
podman push registry.example.local/java-sample:v1
```

::: warning
環境によっては、ローカルレジストリや社内レジストリの事前準備が必要です。
`registry.example.local` は、講師から案内された値に置き換えてください。
:::

## 32-5. Kubernetes にデプロイする

`java-sample.yaml` の例:

```bash
cat <<'EOF' > java-sample.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-sample
spec:
  replicas: 1
  selector:
    matchLabels:
      app: java-sample
  template:
    metadata:
      labels:
        app: java-sample
    spec:
      containers:
        - name: java-sample
          image: registry.example.local/java-sample:v1
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: java-sample
spec:
  selector:
    app: java-sample
  type: NodePort
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30082
EOF
```

作成する内容は次の通りです。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-sample
spec:
  replicas: 1
  selector:
    matchLabels:
      app: java-sample
  template:
    metadata:
      labels:
        app: java-sample
    spec:
      containers:
        - name: java-sample
          image: registry.example.local/java-sample:v1
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: java-sample
spec:
  selector:
    app: java-sample
  type: NodePort
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30082
```

```bash
kubectl apply -f java-sample.yaml
kubectl get pods
kubectl get svc
curl http://localhost:30082
```

::: warning
この章では分かりやすさのために `nodePort: 30082` を固定しています。
同じクラスターを複数人で共有する場合は、受講者ごとに Namespace や NodePort を分けてください。
:::

`Hello Java on k3s!` が返れば成功です。

::: tip
ハッカソンでは、`HelloController` の代わりに自分たちの API や画面を実装します。
コンテナ化とデプロイの流れは、この章と同じ考え方で進められます。
:::
