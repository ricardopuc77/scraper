import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'puestos' })
export class Puesto {

  @Expose({ name: 'idPuesto' })
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ name: 'nombrePuesto' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false
  })
  nombre: string;
}