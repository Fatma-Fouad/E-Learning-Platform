import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { BackupScheduler } from './backup.scheduler';

@Module({
  providers: [BackupService, BackupScheduler], // Register as a service
  controllers: [BackupController], // Register controller separately
  exports: [BackupService, BackupScheduler], // Export if needed in other modules
})
export class BackupModule {}
