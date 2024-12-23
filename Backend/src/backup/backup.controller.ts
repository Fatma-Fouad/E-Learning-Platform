import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { BackupService } from './backup.service';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';
import { BackupScheduler } from './backup.scheduler';

@Controller('backup')
@UseGuards(AuthGuard, RolesGuard) 
@Roles('admin' as Role)
export class BackupController {
  constructor(private readonly backupService: BackupService, private readonly backupScheduler: BackupScheduler) {}

  @Get('start')
  async startBackup() {
    await this.backupService.backupToAnotherDatabase();
    const timestamp = new Date().toISOString();
    return { message: 'Backup started successfully!', timestamp};
  }

  @Post('schedule')
  async scheduleBackup(@Body() body: { frequency: string }) {
    const { frequency } = body;

    let cronExpression: string;

    if (frequency === 'daily') {
      cronExpression = '0 2 * * *'; // Every day at 2:00 AM
    } else if (frequency === 'weekly') {
      cronExpression = '0 2 * * 0'; // Every Sunday at 2:00 AM
    } else {
      return { message: 'Invalid frequency. Use "daily" or "weekly".' };
    }

    this.backupScheduler.setBackupSchedule(cronExpression);
    return { message: `Backup schedule updated successfully to ${frequency}.` };
  }

  @Get('last')
  async getLastBackup() {
    // This should retrieve the last backup timestamp from your database or tracking mechanism
    const lastBackupTime = await this.backupService.getLastBackupTime(); // Implement this in the service
    return { lastBackupTime: lastBackupTime || 'No backups yet.' };
  }

}
