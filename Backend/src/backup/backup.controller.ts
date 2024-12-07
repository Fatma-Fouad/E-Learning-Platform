import { Controller, Get } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('start')
  async startBackup() {
    await this.backupService.backupToAnotherDatabase();
    return { message: 'Backup started successfully!' };
  }
}
