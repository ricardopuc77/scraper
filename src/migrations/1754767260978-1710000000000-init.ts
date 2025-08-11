import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1710000000000 implements MigrationInterface {
  name = 'Init1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext;`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    await queryRunner.query(`
      CREATE TABLE puestos (
        id SERIAL PRIMARY KEY,
        nombre CITEXT NOT NULL UNIQUE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE areas (
        id SERIAL PRIMARY KEY,
        nombre CITEXT NOT NULL UNIQUE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE instituciones (
        id SERIAL PRIMARY KEY,
        nombre CITEXT NOT NULL UNIQUE
      );
    `);


    await queryRunner.query(`
      CREATE TABLE source_pages (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL UNIQUE,
        institucion_id INT REFERENCES instituciones(id) ON UPDATE CASCADE ON DELETE SET NULL,
        email CITEXT NULL,
        scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE funcionarios (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        direccion TEXT NULL,
        telefono TEXT NULL,
        puesto_id INT REFERENCES puestos(id) ON UPDATE CASCADE ON DELETE SET NULL,
        area_id INT REFERENCES areas(id) ON UPDATE CASCADE ON DELETE SET NULL,
        institucion_id INT REFERENCES instituciones(id) ON UPDATE CASCADE ON DELETE SET NULL,
        source_page_id INT NOT NULL REFERENCES source_pages(id) ON UPDATE CASCADE ON DELETE CASCADE,
        status SMALLINT NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX uq_funcionarios_semantic
      ON funcionarios (lower(nombre), puesto_id, institucion_id, source_page_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_funcionarios_nombre_trgm
      ON funcionarios USING GIN (nombre gin_trgm_ops);
    `);

    await queryRunner.query(`CREATE INDEX idx_funcionarios_puesto  ON funcionarios (puesto_id);`);
    await queryRunner.query(`CREATE INDEX idx_funcionarios_area    ON funcionarios (area_id);`);
    await queryRunner.query(`CREATE INDEX idx_funcionarios_inst    ON funcionarios (institucion_id);`);
    await queryRunner.query(`CREATE INDEX idx_funcionarios_source  ON funcionarios (source_page_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_funcionarios_source;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_funcionarios_inst;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_funcionarios_area;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_funcionarios_puesto;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_funcionarios_nombre_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_funcionarios_semantic;`);

    await queryRunner.query(`DROP TABLE IF EXISTS funcionarios;`);
    await queryRunner.query(`DROP TABLE IF EXISTS source_pages;`);
    await queryRunner.query(`DROP TABLE IF EXISTS instituciones;`);
    await queryRunner.query(`DROP TABLE IF EXISTS areas;`);
    await queryRunner.query(`DROP TABLE IF EXISTS puestos;`);

    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS citext;`);
  }
}
