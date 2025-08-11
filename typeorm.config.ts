import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
});
