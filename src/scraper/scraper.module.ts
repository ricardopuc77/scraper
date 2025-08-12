import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService]
})
export class ScraperModule { }
