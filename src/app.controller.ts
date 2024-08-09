import {
    Controller,
    Get,
    HttpStatus,
    Param,
    Query,
    Req,
    Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import * as crypto from 'crypto';

export const secretKey = 'your_secret_key';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/auth')
    auth(
        @Req()
        request: Request & {
            cookies: { [key: string]: string };
            token: boolean;
            uuid?: string;
            isTokenValid?: boolean;
        },
        @Res({ passthrough: true })
        response: Response,
        @Query('secret') secret: string,
    ) {
        if (secret !== process.env.WEB_SECRET) {
            console.log('no secret request');
            response.status(HttpStatus.BAD_REQUEST).send();
            return;
        }
        response.status(HttpStatus.OK);
        if (request.token) {
            return { isTokenValid: true };
        }
        const newJwt = jwt.sign(
            {
                uuid: request.uuid ?? crypto.randomUUID(),
            },
            secretKey,
            {
                expiresIn: '5m',
            },
        );
        return { newJwt, isTokenValid: request?.isTokenValid ?? false };
    }
}
