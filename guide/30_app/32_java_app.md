# 32. Java のアプリをコンテナで動かす

ここでは、Spring Boot を例に Java アプリをコンテナ化して `k3s` にデプロイします。

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

## 32-4. イメージをビルドして push する

```bash
podman build -t java-sample:v1 .
podman tag java-sample:v1 registry.example.local/java-sample:v1
podman push registry.example.local/java-sample:v1
```

## 32-5. Kubernetes にデプロイする

`java-sample.yaml` の例:

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

`Hello Java on k3s!` が返れば成功です。
