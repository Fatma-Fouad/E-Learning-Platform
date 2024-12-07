import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';

@Module({
  providers: [BackupService], // Register as a service
  controllers: [BackupController], // Register controller separately
  exports: [BackupService], // Export if needed in other modules
})
export class BackupModule {}
