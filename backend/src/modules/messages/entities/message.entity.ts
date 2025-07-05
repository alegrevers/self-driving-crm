import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FunnelStatus {
  RECEIVED = 'received',
  PROCESSING = 'processing',
  CLASSIFIED = 'classified',
  FAILED = 'failed',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: FunnelStatus,
    default: FunnelStatus.RECEIVED,
  })
  status: FunnelStatus;

  @Column({ nullable: true })
  funnelStage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}