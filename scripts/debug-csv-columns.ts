import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

const csvPath = path.join(__dirname, '../data/Master Budget - Cost Center (1).csv');

let firstRow: any = null;

fs.createReadStream(csvPath)
  .pipe(csv({ skipLines: 1 }))
  .on('data', (row: any) => {
    if (!firstRow) {
      firstRow = row;
      const keys = Object.keys(row);
      
      console.log('\nColumn Keys and Values:');
      console.log('='.repeat(80));
      
      keys.forEach((key, index) => {
        console.log(`[${index}] "${key}" = "${row[key]}"`);
      });
      
      console.log('\n='.repeat(80));
      console.log('\nTarget columns:');
      console.log(`keys[15] = "${keys[15]}" -> "${row[keys[15]]}"`);
      console.log(`keys[19] = "${keys[19]}" -> "${row[keys[19]]}"`);
      
      process.exit(0);
    }
  });
