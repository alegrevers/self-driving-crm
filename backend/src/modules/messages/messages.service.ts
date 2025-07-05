import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { EncryptionService } from '../shared/encryption/encryption.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly encryptionService: EncryptionService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async createAndEnqueue(createMessageDto: CreateMessageDto): Promise<Message> {
    const encryptedContent = this.encryptionService.encrypt(createMessageDto.content);

    const message = this.messageRepository.create({
      ...createMessageDto,
      content: encryptedContent,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.amqpConnection.publish(
      'kobi_exchange',
      'new_message',
      { messageId: savedMessage.id },
    );

    return savedMessage;
  }
}