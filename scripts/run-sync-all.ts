import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from '../src/app.module';
import { GoogleSheetsService } from '../src/google-sheets/google-sheets.service';

dotenv.config();

async function run() {
  const appCtx = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const svc = appCtx.get(GoogleSheetsService);

  const lastConfigName = process.env.LAST_CONFIG_NAME;
  const triggeredBy = process.env.TRIGGERED_BY;

  try {
    console.log('Starting syncAllConfigs (CLI)...');
    const result = await svc.syncAllConfigs();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Sync failed:', err);
    process.exitCode = 1;
  } finally {
    await appCtx.close();
  }
}

run();
