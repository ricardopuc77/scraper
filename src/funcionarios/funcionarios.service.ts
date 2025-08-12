import { Injectable } from '@nestjs/common';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Repository } from 'typeorm';
import { Institucion } from './entities/instituciones.entity';
import { Puesto } from './entities/puestos.entity';
import { Funcionario } from './entities/funcionario.entity';

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
    // Logic to fetch resources, e.g., from a database or an external API
    const areas = await this.areaRepository.find();
    const instituciones = await this.institucionRepository.find();
    const puestos = await this.puestoRepository.find();
    return {
      areas,
      instituciones,
      puestos
    };
  }
}
