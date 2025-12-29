import { Test, TestingModule } from "@nestjs/testing";
import { ApiKeyGuard } from "./api-key.guard";
import { SecretsService } from "../aws/secrets.service";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

describe("ApiKeyGuard", () => {
  let apiKeyGuard: ApiKeyGuard;
  let secretsService: SecretsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: SecretsService,
          useValue: {
            getSecretValue: jest.fn(),
          },
        },
      ],
    }).compile();

    apiKeyGuard = module.get<ApiKeyGuard>(ApiKeyGuard);
    secretsService = module.get<SecretsService>(SecretsService);
  });

  it("should be defined", () => {
    expect(apiKeyGuard).toBeDefined();
  });

  describe("validateRequest", () => {
    it("should throw an error if authorization header is missing", async () => {
      const request = { headers: {} };
      try {
        await apiKeyGuard.validateRequest(request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response).toBe("Authorization header missing");
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
      }
    });

    it("should return false if the API key does not match the secret", async () => {
      const request = { headers: { authorization: "Bearer invalid-api-key" } };
      jest
        .spyOn(secretsService, "getSecretValue")
        .mockResolvedValueOnce(
          JSON.stringify({ orders_api_key: "valid-api-key" })
        );

      const result = await apiKeyGuard.validateRequest(request);
      expect(result).toBe(false);
    });

    it("should return true if the API key matches the secret", async () => {
      const request = { headers: { authorization: "Bearer valid-api-key" } };
      jest
        .spyOn(secretsService, "getSecretValue")
        .mockResolvedValueOnce(
          JSON.stringify({ orders_api_key: "valid-api-key" })
        );

      const result = await apiKeyGuard.validateRequest(request);
      expect(result).toBe(true);
    });

    it("should return false if there is an error parsing the secrets", async () => {
      const request = { headers: { authorization: "Bearer valid-api-key" } };
      jest
        .spyOn(secretsService, "getSecretValue")
        .mockResolvedValueOnce("invalid-json");

      const result = await apiKeyGuard.validateRequest(request);
      expect(result).toBe(false);
    });
  });

  describe("canActivate", () => {
    it("should call validateRequest method", async () => {
      const request = { headers: { authorization: "Bearer valid-api-key" } };
      const executionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(request),
        }),
      } as unknown as ExecutionContext;

      const spy = jest
        .spyOn(apiKeyGuard, "validateRequest")
        .mockResolvedValue(true);

      await apiKeyGuard.canActivate(executionContext);

      expect(spy).toHaveBeenCalledWith(request);
    });
  });
});
