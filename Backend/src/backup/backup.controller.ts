import { Controller, Get, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { AuthGuard } from 'src/authentication/auth.guard';
import { Roles, Role } from 'src/authentication/roles.decorator';
import { RolesGuard } from 'src/authentication/roles.guard';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('start')
  @UseGuards(AuthGuard) 
  async startBackup() {
    await this.backupService.backupToAnotherDatabase();
    return { message: 'Backup started successfully!' };
  }
}
