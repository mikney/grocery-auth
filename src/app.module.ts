import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ParsingModule } from './parsing/parsing.module';
@Module({
    imports: [ConfigModule.forRoot(), ParsingModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
