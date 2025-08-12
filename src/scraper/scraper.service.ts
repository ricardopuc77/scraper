import { Injectable } from '@nestjs/common';
import { exec, execFile } from 'child_process';
import { join } from 'path';

@Injectable()
export class ScraperService {

  async runScraper(): Promise<string> {
    const scriptPath = join(__dirname, '../../../scraper/main.py');
    const pythonExec = join(__dirname, '../../../scraper/.venv/Scripts/python.exe');
    return new Promise((resolve, reject) => {
      execFile(
        pythonExec,
        [scriptPath],
        {
          env: {
            ...process.env,
            PATH: `${join(__dirname, '../../../scraper/.venv/Scripts')};${process.env.PATH}`,
          },
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Error:', error.message);
            return reject(error.message);
          }
          if (stderr) {
            console.warn('⚠️ stderr:', stderr);
          }
          console.log('✅ Output:', stdout);
          resolve(stdout);
        }
      );
    });

  }

}
