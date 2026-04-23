import { PartialType } from '@nestjs/swagger';
import { CreateUserActivitiesAssignmentDto } from './create-user-activities-assignment.dto';

export class UpdateUserActivitiesAssignmentDto extends PartialType(CreateUserActivitiesAssignmentDto) {}
