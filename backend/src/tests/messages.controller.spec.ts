import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from '../modules/messages/messages.controller';
import { MessagesService } from '../modules/messages/messages.service';
import { CreateMessageDto } from '../modules/messages/dto/create-message.dto';

const mockMessagesService = {
  createAndEnqueue: jest.fn(),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call messagesService.createAndEnqueue with the correct DTO', async () => {
      const createMessageDto: CreateMessageDto = {
        customerName: 'Test Customer',
        content: 'This is a test message.',
      };

      const result = { id: 'some-uuid', ...createMessageDto, status: 'received' };
      mockMessagesService.createAndEnqueue.mockResolvedValue(result);

      await controller.create(createMessageDto);

      expect(mockMessagesService.createAndEnqueue).toHaveBeenCalledWith(createMessageDto);
    });
  });
});