# The deployment of infrastructure should be done in the following order

1. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/vpc.ts"`

1.1.
```
Before deploying bastion stack make sure to run the following command
 `aws ec2 create-key-pair --region us-east-1 --key-name {{env}}-bastion-key --query 'KeyMaterial' --output text > {{env}}-alfred-bastion-key.pem`
This command creates a key pair and generates a `.pem` file which is your private key so you can ssh into the rds through bastion
```
2. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/bastion.ts"`
3. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/elasticache.ts"`
4. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/rds.ts"`
5. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/cognito.ts"`
6. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/ecr.ts"`
7. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/certificate.ts"` -- this is a one time thing and every {stage} uses the same domain
When executing certificate stack, if it takes a long time then log in into AWS Console > Certificate Manager
and add the DNS record manually without stopping the CLI process. After the DNS CNAME record gets added the CLI process should finish very quickly

7.1
```
Before deploying the ECS you need to make sure you deploy the code to the repository.
This can be done either by triggering a new GH action `Dashboard API ECR Image Deploy` and target your environment
```
7.2
```
After deploying the image to ECR, make sure to update the secrets under {{env}}/keys with the right values
```
7.3
```
TODO: Find a way to run the migrations.
Currently done by SSH tunneling to bastion and running the migrations from local to {{env}}
```

7. `cdk deploy --app "npx ts-node --prefer-ts-exts bin/ecs.ts"`


Deployment example command:
```
STAGE={your-stage} AWS_ACCOUNT={account-id} AWS_REGION={region} cdk deploy --app "npx ts-node --prefer-ts-exts bin/{your-stack-here}.ts"
```