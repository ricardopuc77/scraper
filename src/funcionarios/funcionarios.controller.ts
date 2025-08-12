import { Controller, Get, Query } from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { FilterFuncionarioDto } from './dto/filter-funcionario.dto';

@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) { }

  @Get()
  listFuncionarios(@Query() filters: FilterFuncionarioDto) {
    return this.funcionariosService.listFuncionarios(filters);
  }

  @Get('/getResources')
  getResources() {
    return this.funcionariosService.getResources();
  }


}
