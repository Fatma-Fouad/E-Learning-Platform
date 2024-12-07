import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoginAttemptDocument = LoginAttempt & Document;

@Schema()
export class LoginAttempt {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  status: 'SUCCESS' | 'FAILURE';

  @Prop({ default: () => new Date() })
  timestamp: Date;

  @Prop()
  reason?: string;
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt);
