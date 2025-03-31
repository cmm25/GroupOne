import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

class MintTokensDto {
  address: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('contract-address')
  getContractAddress() {
    return this.appService.getContractAddress();
  }

  @Post('mint-tokens')
  mintTokens(@Body() mintTokensDto: MintTokensDto) {
    return this.appService.mintTokens(mintTokensDto.address);
  }
}
