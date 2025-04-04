import { Module } from '@nestjs/common';
import { ConfigModule} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
