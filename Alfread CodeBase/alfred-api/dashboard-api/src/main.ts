require("dotenv").config();import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./exceptions/allexceptions.filter";
import { PermissionModule } from "./permission/permission.module";
import { PermissionService } from "./permission/permission.service";
import { IRoute } from "./route.interface";
import * as fs from "fs";
import datasource from "../database/datasource";
import { MigrationExecutor } from "typeorm";

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("")
    .setDescription("API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
}

function getHttpOptions() {
  const keyFile = `./secrets/key.pem`;
  const certFile = `./secrets/cert.pem`;
  const httpOptions = {
    key: null,
    cert: null,
  };
  if (fs.existsSync(keyFile)) {
    httpOptions.key = fs.readFileSync(keyFile);
  }
  if (fs.existsSync(certFile)) {
    httpOptions.cert = fs.readFileSync(certFile);
  }
  return httpOptions;
}

async function getNestApp(httpsOptions: { key: string; cert: string }) {
  const app = await NestFactory.create(AppModule, {
    ...(httpsOptions?.key && httpsOptions?.cert ? { httpsOptions } : null),
    rawBody: true,
  });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  setupSwagger(app);

  app.useGlobalFilters(new AllExceptionsFilter());
  return app;
}

async function bootstrapHTTP() {
  const app = await getNestApp(null);
  await app.listen(3000);
  await createPermissions(app);
  try {
    await runMigrations();
  } catch (err) {
    console.log("Failed executing migrations: ", err);
  }
}

async function bootstrapHTTPS() {
  const app = await getNestApp(getHttpOptions());
  await app.listen(443);
}

async function createPermissions(app: INestApplication) {
  const server = app.getHttpServer();
  const router = server._events.request._router;

  const routes = getRoutes(router);
  const permissionService = app.select(PermissionModule).get(PermissionService);
  await permissionService.createBatch(routes);
}

async function runMigrations() {
  try {
    if (!datasource.isInitialized) {
      await datasource.initialize();
      console.log("Datasource initialized");
    }
    console.log("datasource-initialized:", datasource.isInitialized);

    const migrationExecutor = new MigrationExecutor(datasource);
    const allMigrations = await migrationExecutor.getAllMigrations();
    console.log("All migrations:", allMigrations);

    const pendingMigrations = await migrationExecutor.getPendingMigrations();
    console.log("Pending migrations:", pendingMigrations);

    const migrations = await datasource.runMigrations({
      transaction: "all",
    });

    console.log("Ran migrations:", migrations);
  } catch (error) {
    console.error("Error running migrations:", error);
  }
}

function getRoutes(router): IRoute[] {
  return router.stack
    .map((layer) => {
      if (layer.route) {
        return {
          path: layer.route?.path,
          method: layer.route?.stack[0].method,
        };
      }
    })
    .filter((item) => item !== undefined);
}

(async () => {
  await bootstrapHTTP();
})();
