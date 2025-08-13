import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Repository } from 'typeorm';
import { Institucion } from './entities/instituciones.entity';
import { Puesto } from './entities/puestos.entity';
import { Funcionario } from './entities/funcionario.entity';
import { FilterFuncionarioDto } from './dto/filter-funcionario.dto';

@Injectable()
export class FuncionariosService {

  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @InjectRepository(Institucion)
    private readonly institucionRepository: Repository<Institucion>,
    @InjectRepository(Puesto)
    private readonly puestoRepository: Repository<Puesto>,
    @InjectRepository(Funcionario)
    private readonly funcionarioRepository: Repository<Funcionario>,
  ) { }

  async getResources() {
    const areas = await this.areaRepository.find();
    const instituciones = await this.institucionRepository.find();
    const puestos = await this.puestoRepository.find();
    return {
      areas,
      instituciones,
      puestos
    };
  }

  async listFuncionarios(filters: FilterFuncionarioDto) {
    const queryBuilder = this.funcionarioRepository.createQueryBuilder('funcionario')
      .leftJoinAndSelect('funcionario.institucion', 'institucion')
      .leftJoinAndSelect('funcionario.area', 'area')
      .leftJoinAndSelect('funcionario.puesto', 'puesto');

    if (filters.nombre) {
      queryBuilder.andWhere('LOWER(funcionario.nombre) LIKE unaccent(LOWER(:nombre))', {
        nombre: `%${filters.nombre}%`,
      });
    }

    if (filters.institucionId) {
      queryBuilder.andWhere('institucion.id = :institucionId', { institucionId: filters.institucionId });
    }

    if (filters.areaId) {
      queryBuilder.andWhere('area.id = :areaId', { areaId: filters.areaId });
    }

    if (filters.puestoId) {
      queryBuilder.andWhere('puesto.id = :puestoId', { puestoId: filters.puestoId });
    }

    return await queryBuilder.getMany();
  }
}
