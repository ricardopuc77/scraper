import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'areas' })
export class Area {

  @Expose({ name: 'idArea' })
  @PrimaryGeneratedColumn()
  id: number;

  @Expose({ name: 'nombreArea' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false
  })
  nombre: string;
}