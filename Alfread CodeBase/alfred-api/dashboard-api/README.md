## Installation

```bash
$ npm install
```

## Initial setup

```bash
$ npm run setup:init tenant={put-your-tenant-name-here} email={your-own-email} stage=local
```
This will run a cli script to create tenant setup in aws

## First time init auth

```bash
$ node_modules/.bin/ts-node initauth.ts
```
This is needed for first time authentication, to complete the COGNITO challenge.
Update the `initauth.ts` file with your credentials

## Authenticate with your user

```bash
$ node_modules/.bin/ts-node authenticatehelper.ts
```
This will return auth, id, session token.
Update the `authenticatehelper.ts` file with your credentials

## Database

```bash
$ docker-compose up -d
```

## Run in port 443

```
openssl req -x509 -nodes -days 365 \
    -subj  "/C=CA/ST=QC/O=company Inc/CN=company.com" \
     -newkey rsa:2048 -keyout ./secrets/key.pem \
     -out ./secrets/cert.pem;
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Issues encountered
If using docker container on ec2 with ecs with if network mode `bridge` does not work run the following in host machine:
```
apt-get install bridge-utils
pkill docker
iptables -t nat -F
ifconfig docker0 down
brctl delbr docker0
service docker restart
```
Otherwise `host` network mode works like a charm but is considered unsafe

## Connecting to dev db
Public access is restricted so port forwarding is required
local -> ssh server -> db
```
ssh -L 127.0.0.1:5433:{dev-db-host}:5432 ec2-user@{ec2-host-url} -i ~/.ssh/{your-private-rsa-key}.pem -N
```
