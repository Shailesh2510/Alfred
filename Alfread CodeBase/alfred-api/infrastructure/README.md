Steps to deploying infrastructure


1. Deploy the ECR stack
```
cd ecr
cdk boostrap && cdk deploy
```

2. Go to dashboard-api and build the docker image and push it to the ECR
```
docker build -f Dockerfile.production --no-cache -t dashboard-api:latest . && docker tag dashboard-api:latest {aws-account-id}.dkr.ecr.us-east-1.amazonaws.com/dashboard-api:latest && docker push {aws-account-id}.dkr.ecr.us-east-1.amazonaws.com/dashboard-api:latest
```

3. Deploy the ECS stack
```
cd ecs
cdk boostrap && cdk deploy
```

