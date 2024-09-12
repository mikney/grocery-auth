import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ParsingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const secret = req.query.secret;
        if (secret !== process.env.WEB_SECRET) {
            console.log('no secret request');
            res.status(HttpStatus.BAD_REQUEST).send();
            return;
        }
        next();
    }
}
