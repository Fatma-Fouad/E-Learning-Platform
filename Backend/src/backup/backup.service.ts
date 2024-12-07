import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class BackupService {
  private readonly sourceUri = 'mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink'; // Update with your source DB URI
  private readonly targetUri = 'mongodb+srv://softwareproject:sp123@clustersp.wvdbq.mongodb.net/EduLink-Backup'; // Update with your backup DB URI

  async backupToAnotherDatabase(): Promise<void> {
    const sourceClient = new MongoClient(this.sourceUri);
    const targetClient = new MongoClient(this.targetUri);

    try {
      // Connect to both databases
      await sourceClient.connect();
      await targetClient.connect();

      const sourceDb = sourceClient.db();
      const targetDb = targetClient.db();

      // Get all collections from the source database
      const collections = await sourceDb.listCollections().toArray();

      for (const collection of collections) {
        const collectionName = collection.name;

        // Fetch all documents from the current collection
        const documents = await sourceDb.collection(collectionName).find({}).toArray();

        if (documents.length > 0) {
          console.log(`Backing up collection: ${collectionName} (${documents.length} documents)`);

          // Insert documents into the corresponding collection in the target database
          await targetDb.collection(collectionName).insertMany(documents);
        } else {
          console.log(`Skipping empty collection: ${collectionName}`);
        }
      }

      console.log('Backup completed successfully!');
    } catch (error) {
      console.error('Error during backup:', error);
    } finally {
      // Ensure clients are closed
      await sourceClient.close();
      await targetClient.close();
    }
  }
}
