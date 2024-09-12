import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ParsingController } from './parsing.controller';
import { ParsingService } from './parsing.service';
import { PrismaService } from '../prisma/prisma.service';
import { ParsingMiddleware } from './parsing.middleware';

@Module({
    imports: [],
    controllers: [ParsingController],
    providers: [ParsingService, PrismaService],
})
export class ParsingModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ParsingMiddleware).forRoutes('parsing');
    }
}
{
}
