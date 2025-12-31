import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ApexInputService } from './apex-input.service';
import QueryApexInputDto from './dto/query-apex-input.dto';

@ApiTags('apex-input')
@Controller('apex-input')
export class ApexInputController {
  constructor(private readonly service: ApexInputService) {}

  @Get()
  @ApiQuery({ name: 'cost_center', required: false, type: String })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'account_ohada', required: false, type: String })
  @ApiQuery({ name: 'nature_depenses', required: false, type: String })
  @ApiQuery({ name: 'texte', required: false, type: String })
  @ApiQuery({ name: 'tache_id', required: false, type: Number })
  @ApiQuery({ name: 'min_total', required: false, type: Number })
  @ApiQuery({ name: 'max_total', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  async findAll(@Query() query: QueryApexInputDto) {
    return this.service.findAll(query as any);
  }
}

export default ApexInputController;
