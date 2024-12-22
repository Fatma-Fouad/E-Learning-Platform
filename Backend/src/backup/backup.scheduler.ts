import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler {
  private cronJob: CronJob | null = null;

  constructor(private readonly backupService: BackupService) {}

  /**
   * Dynamically sets the cron job for backup
   * @param cronExpression - The cron expression for the backup schedule
   */
  setBackupSchedule(cronExpression: string) {
    if (this.cronJob) {
      console.log('Stopping previous cron job...');
      this.cronJob.stop();
    }

    console.log(`Setting new backup schedule: ${cronExpression}`);
    this.cronJob = new CronJob(cronExpression, async () => {
      console.log('Starting scheduled backup...');
      try {
        await this.backupService.backupToAnotherDatabase();
        console.log('Scheduled backup completed successfully.');
      } catch (error) {
        console.error('Error during scheduled backup:', error);
      }
    });

    this.cronJob.start();
  }
}
