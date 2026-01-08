import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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
  try {
    // Utilisation de Promise.all pour créer toutes les transactions en parallèle
    const createdTransactions = await Promise.all(
      createTransactionDtos.map(dto => this.create(dto))
    );
    return createdTransactions;
  } catch (error) {
    // Le service lance déjà BadRequestException
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

}
