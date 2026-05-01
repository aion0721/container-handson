# 92. 次のステップ

![ページのイメージ図](/illustrations/conclusion.svg)


余裕があれば、次の内容にもチャレンジしてみてください。

- `podman logs` でログを確認する
- `podman exec` でコンテナの中に入る
- Ingress で複数のアプリをパスごとに公開する
- Deployment のレプリカ数を増やす
- ConfigMap を使って設定値を外出しする

## 参考コマンド集

### Podman

```bash
podman pull docker.io/library/httpd:2.4
podman images
podman image inspect docker.io/library/httpd:2.4
podman run -d --name my-httpd -p 8080:80 docker.io/library/httpd:2.4
podman ps
podman ps -a
podman stop my-httpd
podman start my-httpd
podman rm my-httpd
podman rmi docker.io/library/httpd:2.4
podman build -t my-httpd:v1 .
podman save -o my-httpd-v1.tar my-httpd:v1
podman load -i my-httpd-v1.tar
```

### Kubernetes

```bash
kubectl get pods
kubectl get svc
kubectl get deployments
kubectl get ingress
kubectl delete pod <pod_name>
kubectl scale deployment <deployment_name> --replicas=3
kubectl rollout status deployment/<deployment_name>
kubectl rollout undo deployment/<deployment_name>
kubectl apply -f my-httpd.yaml
kubectl delete -f my-httpd.yaml
kubectl run httpd --image=docker.io/library/httpd:2.4 --port=80
kubectl expose pod httpd --type=NodePort --port=80
kubectl describe ingress <ingress_name>
```
