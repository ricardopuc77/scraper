import { Module } from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { FuncionariosController } from './funcionarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { Institucion } from './entities/instituciones.entity';
import { Puesto } from './entities/puestos.entity';
import { Funcionario } from './entities/funcionario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Area, Institucion, Puesto, Funcionario]),
  ],
  controllers: [FuncionariosController],
  providers: [FuncionariosService],
})
export class FuncionariosModule { }
