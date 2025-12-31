import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ApexInputController from './apex-input.controller';
import { ApexInputService } from './apex-input.service';
import { ApexInput } from './apex-input.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApexInput])],
  controllers: [ApexInputController],
  providers: [ApexInputService],
  exports: [ApexInputService],
})
export class ApexInputModule {}

export default ApexInputModule;
