import { IsIn } from 'class-validator';

export class ExportQueryDto {
  @IsIn(['csv', 'json'])
  format: 'csv' | 'json';
}
