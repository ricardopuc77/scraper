import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperModule } from './scraper/scraper.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL_NEST,
      autoLoadEntities: true,
      synchronize: false,
    }),
    ScraperModule,
    FuncionariosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
