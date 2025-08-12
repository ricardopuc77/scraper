import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Puesto } from "./puestos.entity";
import { Area } from "./area.entity";
import { Institucion } from "./instituciones.entity";

@Entity({ name: "funcionarios" })
export class Funcionario {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  nombre: string;

  @Column({ type: "varchar", length: 100 })
  direccion: string;

  @Column({ type: "varchar", length: 100 })
  telefono: string;

  @ManyToOne(
    () => Puesto,
    (puesto) => puesto.id,
    { eager: true, nullable: false }
  )
  @JoinColumn({ name: "puesto_id" })
  puesto: Puesto;

  @ManyToOne(
    () => Area,
    (area) => area.id,
    { eager: true, nullable: false }
  )
  @JoinColumn({ name: "area_id" })
  area: Area;

  @ManyToOne(
    () => Institucion,
    (institucion) => institucion.id,
    { eager: true, nullable: false }
  )
  @JoinColumn({ name: "institucion_id" })
  institucion: Institucion;

  @Column({ type: "integer", default: 1 })
  status: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;
}
