import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, DeleteTransactionsArrayDto, DeleteTransactionsDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

@Post('multiple')
async createTransactionMultiple(
  @Body() createTransactionDtos: CreateTransactionDto[]
) {
  console.log('BODY REÇU =>', createTransactionDtos);

  try {
    const createdTransactions = await Promise.all(
      createTransactionDtos.map(dto => this.create(dto))
    );
    return createdTransactions;
  } catch (error) {
    console.error('ERREUR CONTROLLER =>', error);
    throw error;
  }
}


  @Post('has/transaction')
  isTransactionExist(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.isTransactionExist(createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }


  @Get('total/consomme/annuel/:year')
  findTotalConsommeAnnuel2(@Param('year') year:string) {
    return this.transactionsService.getTotalDepense(+year);
  }

  @Get('total/consomme/department/annuel/:year')
  findTotalConsommeAnnueldepartment(@Param('year') year:string) {
    return this.transactionsService.getDepensePardepartmentAvecAnnee(+year);
  }

  @Get('total/details/consomme/department/annuel')
  getDepensesPardepartmentByActualYear(){
    return this.transactionsService.getDepensesPardepartmentByActualYear()
  }

  @Get('total/details/consomme/department/annuel/:year')
  getDepensesPardepartmentByYearPrecision(@Param('year') year:string){
    return this.transactionsService.getDepensesPardepartmentByYearPrecision(+year)
  }


  @Delete('removeItem/:id')
  remove(@Param('id') id: string) {
    const item=this.transactionsService.removeId(+id);
 //   this.eventsGateway.broadcastEvent('LOAD_TDR');
    return item;
  }

  @Post('delete-many')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMany(
    @Body() dto: DeleteTransactionsDto,
  ): Promise<void> {
    await this.transactionsService.removeByIds(dto.ids);
  }


  @Post('delete-multiple')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMultiple(@Body() dto: DeleteTransactionsArrayDto): Promise<void> {
    await this.transactionsService.removeMultiple(dto.transactions);
  }

}
