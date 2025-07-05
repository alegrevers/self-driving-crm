import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from './modules/messages/messages.module';
import { RabbitMQModule } from './modules/shared/rabbitmq/rabbitmq.module';
import { Message } from './modules/messages/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [Message],
        synchronize: true, 
      }),
    }),
    RabbitMQModule,
    MessagesModule,
  ],
})
export class AppModule {}