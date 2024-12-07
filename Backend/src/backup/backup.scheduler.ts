import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler implements OnModuleInit {
  constructor(private readonly backupService: BackupService) {}

  onModuleInit() {
    // Schedule backup at 2:00 AM daily
    cron.schedule('1 0 * * *', async () => {
      console.log('Starting backup...');
      await this.backupService.backupToAnotherDatabase();
    });
  }
}
