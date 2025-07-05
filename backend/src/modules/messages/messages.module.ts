import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { EncryptionService } from '../shared/encryption/encryption.service';
import { GeminiService } from '../shared/gemini/gemini.service';
import { MessageConsumer } from './consumers/message.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, EncryptionService, GeminiService, MessageConsumer],
})
export class MessagesModule {}