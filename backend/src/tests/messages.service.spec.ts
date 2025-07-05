import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { MessagesService } from '../modules/messages/messages.service';
import { Message } from '../modules/messages/entities/message.entity';
import { EncryptionService } from '../modules/shared/encryption/encryption.service';
import { CreateMessageDto } from '../modules/messages/dto/create-message.dto';
import { Repository } from 'typeorm';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockEncryptionService = {
  encrypt: jest.fn(),
};

const mockAmqpConnection = {
  publish: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;
  let repository: Repository<Message>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(Message), useValue: mockRepository },
        { provide: EncryptionService, useValue: mockEncryptionService },
        { provide: AmqpConnection, useValue: mockAmqpConnection },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    repository = module.get<Repository<Message>>(getRepositoryToken(Message));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAndEnqueue', () => {
    it('should encrypt content, save the message, and publish to RabbitMQ', async () => {
      const dto: CreateMessageDto = {
        customerName: 'John Doe',
        content: 'Original content',
      };
      const encryptedContent = 'encrypted-content';
      const createdMessage = { ...dto, content: encryptedContent };
      const savedMessage = { id: 'uuid-123', ...createdMessage };

      mockEncryptionService.encrypt.mockReturnValue(encryptedContent);
      mockRepository.create.mockReturnValue(createdMessage);
      mockRepository.save.mockResolvedValue(savedMessage);
      mockAmqpConnection.publish.mockResolvedValue(undefined);

      const result = await service.createAndEnqueue(dto);

      expect(mockEncryptionService.encrypt).toHaveBeenCalledWith(dto.content);
      expect(mockRepository.create).toHaveBeenCalledWith({ ...dto, content: encryptedContent });
      expect(mockRepository.save).toHaveBeenCalledWith(createdMessage);
      expect(mockAmqpConnection.publish).toHaveBeenCalledWith(
        'kobi_exchange',
        'new_message',
        { messageId: savedMessage.id },
      );
      expect(result).toEqual(savedMessage);
    });
  });
});