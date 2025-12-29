import { Test, TestingModule } from "@nestjs/testing";
import { AppConfigService } from "./appConfig.service";
import {
  AppConfigDataClient,
  StartConfigurationSessionCommandOutput,
  GetLatestConfigurationCommandOutput,
  StartConfigurationSessionCommand,
  GetLatestConfigurationCommand,
} from "@aws-sdk/client-appconfigdata";
import { HttpException } from "@nestjs/common";
jest.mock("@aws-sdk/client-appconfigdata");

describe("AppConfigService", () => {
  let service: AppConfigService;
  let mockAppConfigClient: jest.Mocked<AppConfigDataClient>;

  const mockFeatureFlags = {
    testFlag: {
      enabled: true,
      value: "test-value",
    },
    disabledFlag: {
      enabled: false,
      value: "disabled-value",
    },
  };

  beforeEach(async () => {
    // Clear all environment variables before each test
    process.env = {
      AWS_ACCESS_KEY_ID: "test-access-key",
      AWS_SECRET_ACCESS_KEY: "test-secret-key",
      AWS_APP_CONFIG_APPLICATION_ID: "test-app-id",
      AWS_APP_CONFIG_ENVIRONMENT_ID: "test-env-id",
      AWS_APP_CONFIG_CONFIGURATION_PROFILE_ID: "test-profile-id",
    };

    // Setup mock implementation
    mockAppConfigClient = {
      send: jest.fn().mockImplementation((command) => {
        switch (command.constructor) {
          case StartConfigurationSessionCommand:
            return Promise.resolve({
              InitialConfigurationToken: "test-token",
              $metadata: {},
            }) as Promise<StartConfigurationSessionCommandOutput>;
          case GetLatestConfigurationCommand:
            return Promise.resolve({
              Configuration: new TextEncoder().encode(
                JSON.stringify(mockFeatureFlags)
              ),
              $metadata: {},
            }) as Promise<GetLatestConfigurationCommandOutput>;
          default:
            return Promise.reject(new Error("Unknown command"));
        }
      }),
    } as any as jest.Mocked<AppConfigDataClient>;

    (AppConfigDataClient as jest.Mock).mockImplementation(
      () => mockAppConfigClient
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [AppConfigService],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create AppConfigDataClient with correct configuration", () => {
      expect(AppConfigDataClient).toHaveBeenCalledWith({
        region: expect.any(String),
        credentials: {
          accessKeyId: "test-access-key",
          secretAccessKey: "test-secret-key",
        },
      });
    });
  });

  describe("fetchFeatureFlagValue", () => {
    it("should return flag value when flag is enabled", async () => {
      const result = await service.fetchFeatureFlagValue("testFlag");
      expect(result).toBe("test-value");
    });

    it("should return false when flag is disabled", async () => {
      const result = await service.fetchFeatureFlagValue("disabledFlag");
      expect(result).toBe(false);
    });

    it("should return false when flag does not exist", async () => {
      const result = await service.fetchFeatureFlagValue("nonexistentFlag");
      expect(result).toBe(false);
    });
  });

  describe("initializeAwsAppConfigfetch", () => {
    it("should throw HttpException when start session fails", async () => {
      mockAppConfigClient.send.mockImplementationOnce(() =>
        Promise.reject(new Error("Start session failed"))
      );

      await expect(service.initializeAwsAppConfigfetch()).rejects.toThrow(
        HttpException
      );
    });

    it("should throw error when session token is missing", async () => {
      mockAppConfigClient.send.mockImplementationOnce(() =>
        Promise.resolve({
          InitialConfigurationToken: undefined,
          $metadata: {},
        } as StartConfigurationSessionCommandOutput)
      );

      await expect(service.initializeAwsAppConfigfetch()).rejects.toThrow(
        "Failed to fetch feature flags"
      );
    });

    it("should throw HttpException when getting configuration fails", async () => {
      mockAppConfigClient.send
        .mockImplementationOnce(() =>
          Promise.resolve({
            InitialConfigurationToken: "test-token",
            $metadata: {},
          } as StartConfigurationSessionCommandOutput)
        )
        .mockImplementationOnce(() =>
          Promise.reject(new Error("Get configuration failed"))
        );

      await expect(service.initializeAwsAppConfigfetch()).rejects.toThrow(
        HttpException
      );
    });

    it("should return null when configuration is empty", async () => {
      mockAppConfigClient.send
        .mockImplementationOnce(() =>
          Promise.resolve({
            InitialConfigurationToken: "test-token",
            $metadata: {},
          } as StartConfigurationSessionCommandOutput)
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            Configuration: undefined,
            $metadata: {},
          } as GetLatestConfigurationCommandOutput)
        );

      const result = await service.initializeAwsAppConfigfetch();
      expect(result).toBeNull();
    });

    it("should successfully fetch and parse configuration", async () => {
      const result = await service.initializeAwsAppConfigfetch();
      expect(result).toEqual(mockFeatureFlags);
    });
  });
});
