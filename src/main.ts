import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import * as jwt from 'jsonwebtoken';
import { secretKey } from './app.controller';

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    standardHeaders: false, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    limit: async (req) => {
        if (req['token']) {
            return 15;
        } else {
            return 5;
        }
    },
    keyGenerator: (req) => {
        const token = req.query?.token as string | undefined;
        const ip = (req.query?.ip as string | undefined) ?? 'shared';
        console.log(ip);
        console.log(token);
        if (token) {
            try {
                const data = jwt.verify(token, secretKey) as { uuid: string };
                console.log(data);
                req['token'] = true;

                return data.uuid;
            } catch (e) {
                const error = e as { message: string };
                if (error?.message === 'jwt expired') {
                    const data = jwt.decode(token) as { uuid: string };
                    console.log(data);
                    req['uuid'] = data.uuid;
                    if (data.uuid) {
                        return data.uuid;
                    }
                }
                req['token'] = false;
                console.log(e?.message);
                return ip;
            }
        } else {
            req['token'] = false;
            return ip;
        }
        //
        // console.log('keyGenerator');
        // return req.ip;
    },
    // store: ... , // Redis, Memcached, etc. See below.
});
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.use(limiter);
    await app.listen(9000);
}
bootstrap();
