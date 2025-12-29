import { Test, TestingModule } from "@nestjs/testing";
import { RelayApiKeyGuard } from "./relay-api-key.guard";
import { SecretsService } from "../aws/secrets.service";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

describe("RelayApiKeyGuard", () => {
  let guard: RelayApiKeyGuard;
  let secretsServiceMock: SecretsService;
  let executionContextMock: ExecutionContext;

  beforeEach(async () => {
    secretsServiceMock = { getSecretValue: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelayApiKeyGuard,
        { provide: SecretsService, useValue: secretsServiceMock },
      ],
    }).compile();

    guard = module.get<RelayApiKeyGuard>(RelayApiKeyGuard);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("validateRequest", () => {
    it("should throw an error if the Authorization header is missing", async () => {
      executionContextMock = createExecutionContextMock({ headers: {} });

      await expect(
        guard.canActivate(executionContextMock)
      ).rejects.toThrowError(
        new HttpException("Authorization header missing", HttpStatus.FORBIDDEN)
      );
    });

    it("should return false if the API key does not match the expected key", async () => {
      const mockRequest = {
        headers: {
          authorization: "wrong-api-key",
        },
      };

      executionContextMock = createExecutionContextMock(mockRequest);

      secretsServiceMock.getSecretValue = jest
        .fn()
        .mockResolvedValue(
          JSON.stringify({ relay_webhook_api_key: "correct-api-key" })
        );

      await expect(guard.canActivate(executionContextMock)).resolves.toBe(
        false
      );
    });

    it("should return true if the API key matches the expected key", async () => {
      const mockRequest = {
        headers: {
          authorization: "correct-api-key",
        },
      };

      executionContextMock = createExecutionContextMock(mockRequest);

      secretsServiceMock.getSecretValue = jest
        .fn()
        .mockResolvedValue(
          JSON.stringify({ relay_webhook_api_key: "correct-api-key" })
        );

      await expect(guard.canActivate(executionContextMock)).resolves.toBe(true);
    });

    it("should throw an error if SecretsService fails to retrieve the secret", async () => {
      const mockRequest = {
        headers: {
          authorization: "correct-api-key",
        },
      };

      executionContextMock = createExecutionContextMock(mockRequest);

      secretsServiceMock.getSecretValue = jest
        .fn()
        .mockRejectedValue(new Error("Secrets retrieval failed"));

      await expect(
        guard.canActivate(executionContextMock)
      ).rejects.toThrowError(
        new HttpException(
          "Secrets retrieval failed",
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });

    it("should throw an error if the API key is missing from the retrieved secrets", async () => {
      const mockRequest = {
        headers: {
          authorization: "correct-api-key",
        },
      };

      executionContextMock = createExecutionContextMock(mockRequest);

      secretsServiceMock.getSecretValue = jest
        .fn()
        .mockResolvedValue(JSON.stringify({}));

      await expect(guard.canActivate(executionContextMock)).resolves.toBe(
        false
      );
    });
  });
});

function createExecutionContextMock(request: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
}
