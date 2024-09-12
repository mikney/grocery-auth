import { Controller, Get } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('parsing')
export class ParsingController {
    constructor(
        private readonly parsingService: ParsingService,
        private prisma: PrismaService,
    ) {}
    @Get('/parser-status') async parserStatus() {
        return await this.parsingService.isParsingEnd();
    }

    @Get('/vm') async vm() {
        return await this.parsingService.checkVMStatus();
    }
    @Get('/stop') async stop() {
        return await this.parsingService.stopParsingVM();
    }
    @Get('/start') async start() {
        return await this.parsingService.startParsingVM();
    }
}
