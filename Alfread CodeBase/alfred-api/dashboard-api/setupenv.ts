import { appendFileSync } from "fs";
import { SecretsService } from "./src/aws/secrets.service";
import { writeFileSync } from "fs";

async function setupEnvironment() {
  const secretsService = new SecretsService();
  const environment = process.env.NODE_ENV
  let dbData = await secretsService.getSecretValue(`${environment}/db`)
  let keys = await secretsService.getSecretValue(`${environment}/keys`)
  dbData = JSON.parse(dbData)
  keys = JSON.parse(keys)

  writeFileSync(
    '.env',
    `
ACCESS_KEY_ID=${keys['access_key_id']}
SECRET_ACCESS_KEY=${keys['secret_access_key']}
DASHBOARD_KEYS=${(keys['dashboard_keys'])}
GUEST_KEYS=${(keys['guest_keys'])}
DASHBOARD_POOL_ID=${keys['dashboard_pool_id']}
GUEST_POOL_ID=${keys['guest_pool_id']}
DASHBOARD_POOL_CLIENT_ID=${keys['dashboard_pool_client_id']}
GUEST_POOL_CLIENT_ID=${keys['guest_pool_client_id']}
DB_TYPE=postgres
DB_HOST=${dbData['host']}
DB_PORT=${dbData['port']}
DB_USERNAME=${dbData['username']}
DB_PASSWORD=${dbData['password']}
DB_DATABASE=${dbData['dbInstanceIdentifier']}
PUSHER_APP_ID=${keys['pusher_app_id']}
PUSHER_KEY=${keys['pusher_key']}
PUSHER_SECRET=${keys['pusher_secret']}
PUSHER_CLUSTER=${keys['pusher_cluster']}
PUSHER_USE_TLS=${keys['pusher_use_tls']}
REDIS_HOST=${keys['redis_host']}
REDIS_PORT=${keys['redis_port']}
REDIS_USERNAME=${keys['redis_username']}
REDIS_PASSWORD=${keys['redis_password']}
`,
  );

  console.log('Wrote env file succesfully')
}

(async () => {
  await setupEnvironment();
})()
