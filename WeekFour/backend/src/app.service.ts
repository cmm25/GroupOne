import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress() {
    return { result: '0x1234567890123456789012345678901234567890' };
  }

  async mintTokens(address: string) {
    return { result: true };
  }
}
