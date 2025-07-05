import { RabbitSubscribe, Nack, AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, FunnelStatus } from '../entities/message.entity';
import { EncryptionService } from '../../shared/encryption/encryption.service';
import { GeminiService } from '../../shared/gemini/gemini.service';

@Injectable()
export class MessageConsumer {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly encryptionService: EncryptionService,
    private readonly geminiService: GeminiService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'kobi_exchange',
    routingKey: 'new_message',
    queue: 'messages_queue',
    queueOptions: {
      deadLetterExchange: 'kobi_dlx_exchange',
      deadLetterRoutingKey: 'dlq_message',
    },
  })
  public async handleMessage(msg: { messageId: string }) {
    console.log(`Received message to process: ${msg.messageId}`);
    const message = await this.messageRepository.findOneBy({ id: msg.messageId });

    if (!message) {
      console.error(`Message with ID ${msg.messageId} not found.`);
      return new Nack(false);
    }

    try {
      message.status = FunnelStatus.PROCESSING;
      await this.messageRepository.save(message);

      const decryptedContent = this.encryptionService.decrypt(message.content);

      const funnelStage = await this.geminiService.classifyFunnelStage(decryptedContent);

      message.status = FunnelStatus.CLASSIFIED;
      message.funnelStage = funnelStage;
      await this.messageRepository.save(message);

      console.log(`Message ${message.id} classified as ${funnelStage}`);
    } catch (error) {
      console.error(`Failed to process message ${message.id}:`, error);
      
      message.status = FunnelStatus.FAILED;
      await this.messageRepository.save(message);
      
      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: 'kobi_dlx_exchange',
    routingKey: 'dlq_message',
    queue: 'dlq_messages_queue',
  })
  public async handleDlqMessage(msg: any) {
    console.error(`[DEAD-LETTER] Received failed message:`, msg);
  }
}