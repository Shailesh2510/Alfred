import { NestFactory } from '@nestjs/core';
import { SetupTenantModule } from './cli/setup-tenant/module';
import { SetupTenantService } from './cli/setup-tenant/setup-tenant';

async function main() {
  const app = await NestFactory.createApplicationContext(SetupTenantModule);
  const setupTenantService = app
    .select(SetupTenantModule)
    .get(SetupTenantService);
  const params = {};
  setParams(params, process.argv[2]);
  setParams(params, process.argv[3]);
  setParams(params, process.argv[4]);
  await setupTenantService.create({
    name: params['tenant'],
    superadminEmail: params['email'],
    stage: params['stage'],
  });
  await app.close();
}

function setParams(param, arg) {
  const requiredArgs = ['tenant', 'email', 'stage'];
  const keyval = arg.split('=');
  if (requiredArgs.includes(keyval[0])) {
    param[keyval[0]] = keyval[1];
  } else {
    throw new Error(`Argument ${keyval[0]} unknown`);
  }
  return param;
}

main();
