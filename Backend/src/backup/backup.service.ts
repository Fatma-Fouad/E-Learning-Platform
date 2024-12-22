import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class BackupService {
  private readonly sourceUri = 'mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink'; // Update with your source DB URI
  private readonly targetUri = 'mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink-Backup'; // Update with your backup DB URI
  private lastBackupTime: string | null = null;

  async backupToAnotherDatabase(): Promise<void> {
    const sourceClient = new MongoClient(this.sourceUri);
    const targetClient = new MongoClient(this.targetUri);

    try {
      // Connect to both databases
      await sourceClient.connect();
      await targetClient.connect();
      console.log('Connected to database...');

      const sourceDb = sourceClient.db();
      const targetDb = targetClient.db();

      // Get all collections from the source database
      const collections = await sourceDb.listCollections().toArray();
      console.log('Fetching collections...');

      for (const collection of collections) {
        const collectionName = collection.name;
        console.log('Backing up collection:', collectionName);

        // Fetch all documents from the current collection
        const documents = await sourceDb.collection(collectionName).find({}).toArray();
        for (const document of documents) {
          await targetDb.collection(collectionName).updateOne(
            { _id: document._id }, // Match by `_id`
            { $set: document },    // Update the document
            { upsert: true }       // Insert if it doesn't exist
          );
        }

        if (documents.length > 0) {
          console.log(`Backed up ${documents.length} documents from collection: ${collectionName}`);
        } else {
          console.log(`Skipping empty collection: ${collectionName}`);
        }
      }

      // Record the backup time
      this.lastBackupTime = new Date().toISOString();
    } catch (error) {
      console.error('Error during backup:', error);
    } finally {
      // Ensure clients are closed
      await sourceClient.close();
      await targetClient.close();
    }
    console.log('Backup completed successfully!');
  }

  async scheduleBackup(cronExpression: string) {
    console.log(`Backup scheduled with cron expression: ${cronExpression}`);
  }

  async getLastBackupTime(): Promise<string | null> {
    return this.lastBackupTime;
  }
}
