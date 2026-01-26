import { PartialType } from '@nestjs/mapped-types';
import { CreateRatingDto } from './create-rating.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateRatingDto extends PartialType(
  OmitType(CreateRatingDto, ['movieId'])
) {}
