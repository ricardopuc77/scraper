import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}