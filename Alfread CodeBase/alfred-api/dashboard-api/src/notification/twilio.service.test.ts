import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from './twilio.service';
import { Twilio } from 'twilio';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { PhoneNumberInstance } from 'twilio/lib/rest/lookups/v1/phoneNumber';

jest.mock('twilio');

describe('TwilioService', () => {
  let service: TwilioService;
  let twilioMock: jest.Mocked<Twilio>;

  beforeEach(async () => {
    const createMessageMock = jest.fn();
    const fetchPhoneNumberMock = jest.fn();

    const mockMessages = {
      create: createMessageMock,
    };

    const mockLookups = {
      v1: {
        phoneNumbers: jest.fn().mockReturnValue({
          fetch: fetchPhoneNumberMock,
        }),
      },
    };

    twilioMock = {
      messages: mockMessages,
      lookups: mockLookups,
    } as unknown as jest.Mocked<Twilio>;

    (Twilio as unknown as jest.Mock).mockImplementation(() => twilioMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [TwilioService],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSMS', () => {
    const mockSMSParams = {
      to: '+1234567890',
      body: 'Test message',
    };

    it('should send SMS successfully', async () => {
      const mockResponse: Partial<MessageInstance> = { sid: 'test-sid' };
      jest.spyOn(twilioMock.messages, 'create').mockResolvedValue(mockResponse as MessageInstance);

      const result = await service.sendSMS(mockSMSParams);

      expect(twilioMock.messages.create).toHaveBeenCalledWith({
        from: process.env.TWILIO_SMS_FROM_NUMBER,
        ...mockSMSParams,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when sending SMS fails', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      const error = new Error('Twilio error');
      jest.spyOn(twilioMock.messages, 'create').mockRejectedValue(error);

      await service.sendSMS(mockSMSParams);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Failed triggering pusher event ${error.message}`
      );
    });
  });

  describe('verifyPhone', () => {
    const mockPhoneNumber = '+1234567890';
    const mockCountryCode = 'US';

    it('should verify phone number successfully for matching country code', async () => {
      const mockResponse: Partial<PhoneNumberInstance> = { countryCode: mockCountryCode };
      jest.spyOn(twilioMock.lookups.v1.phoneNumbers(mockPhoneNumber), 'fetch')
        .mockResolvedValue(mockResponse as PhoneNumberInstance);

      await expect(service.verifyPhone(mockPhoneNumber)).rejects.toThrow(
        new HttpException(
          `Phone number ${mockPhoneNumber} could not be verified`,
          HttpStatus.NOT_FOUND
        )
      );
    });

    it('should throw error for non-matching country code', async () => {
      const mockResponse: Partial<PhoneNumberInstance> = { countryCode: 'GB' };
      jest.spyOn(twilioMock.lookups.v1.phoneNumbers(mockPhoneNumber), 'fetch')
        .mockResolvedValue(mockResponse as PhoneNumberInstance);

      await expect(service.verifyPhone(mockPhoneNumber)).rejects.toThrow(
        new HttpException(
          `Phone number ${mockPhoneNumber} could not be verified`,
          HttpStatus.BAD_REQUEST
        )
      );
    });

    it('should handle lookup errors', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');
      const error = new Error('Lookup failed');
      jest.spyOn(twilioMock.lookups.v1.phoneNumbers(mockPhoneNumber), 'fetch')
        .mockRejectedValue(error);

      await expect(service.verifyPhone(mockPhoneNumber)).rejects.toThrow(
        new HttpException(
          `Phone number ${mockPhoneNumber} could not be verified`,
          HttpStatus.NOT_FOUND
        )
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Failed twilio@verifyPhone ${error.message}`
      );
    });
  });
});