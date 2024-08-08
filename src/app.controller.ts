import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import * as jwt from 'jsonwebtoken';

export const secretKey = 'your_secret_key';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('/lol')
    lol(
        @Req()
        request: Request & {
            cookies: { [key: string]: string };
            token: boolean;
            uuid?: string;
        },
    ) {
        if (request.token) {
            return { result: 'success' };
        }
        const newJwt = jwt.sign(
            { success: true, uuid: request.uuid ?? crypto.randomUUID() },
            secretKey,
            {
                expiresIn: '1m',
            },
        );
        return { newJwt };
    }
}
