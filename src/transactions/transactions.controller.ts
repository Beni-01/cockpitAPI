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

  @Get('total/consomme/departement/annuel/:year')
  findTotalConsommeAnnueldepartement(@Param('year') year:string) {
    return this.transactionsService.getDepensePardepartementAvecAnnee(+year);
  }

  @Get('total/details/consomme/departement/annuel')
  getDepensesPardepartementByActualYear(){
    return this.transactionsService.getDepensesPardepartementByActualYear()
  }

  @Get('total/details/consomme/departement/annuel/:year')
  getDepensesPardepartementByYearPrecision(@Param('year') year:string){
    return this.transactionsService.getDepensesPardepartementByYearPrecision(+year)
  }


  @Delete('removeItem/:id')
  remove(@Param('id') id: string) {
    const item=this.transactionsService.removeId(+id);
 //   this.eventsGateway.broadcastEvent('LOAD_TDR');
    return item;
  }

}
