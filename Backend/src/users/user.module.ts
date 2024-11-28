import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'users', schema: UserSchema }]),
  ],
  exports: [MongooseModule],
})
export class UserModule {}
