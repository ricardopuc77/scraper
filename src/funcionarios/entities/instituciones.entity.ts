import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'instituciones' })
export class Institucion {

  @Expose({ name: 'idInstitucion' })
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ name: 'nombreInstitucion' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false
  })
  nombre: string;
}