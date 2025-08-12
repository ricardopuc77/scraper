import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class FilterFuncionarioDto {

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  institucionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  areaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  puestoId?: number;
}