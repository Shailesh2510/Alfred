import { Test, TestingModule } from "@nestjs/testing";import { PusherService } from "./pusher.service";
import * as Pusher from "pusher";

jest.mock("pusher");

describe("PusherService", () => {
  let service: PusherService;
  let pusherMock: jest.Mocked<Pusher>;

  beforeEach(async () => {
    pusherMock =
      new (Pusher as unknown as jest.Mock<Pusher>)() as jest.Mocked<Pusher>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [PusherService],
    }).compile();
    service = module.get<PusherService>(PusherService);
    (service as any).client = pusherMock;
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should trigger a Pusher event successfully", async () => {
    pusherMock.trigger.mockResolvedValue(undefined);
    const channel = "test-channel";
    const event = "test-event";
    const payload = { message: "Hello World" };
    await service.trigger(channel, event, payload);
    expect(pusherMock.trigger).toHaveBeenCalledWith(channel, event, payload);
  });

  it("should log an error if Pusher trigger fails", async () => {
    const loggerSpy = jest.spyOn((service as any).logger, "error");
    const errorMessage = "Pusher error";
    pusherMock.trigger.mockRejectedValue(new Error(errorMessage));
    const channel = "test-channel";
    const event = "test-event";
    const payload = { message: "Hello World" };
    await service.trigger(channel, event, payload);
    expect(loggerSpy).toHaveBeenCalledWith(
      `Failed triggering pusher event ${errorMessage}`
    );
    console.log(errorMessage);
  });
});
