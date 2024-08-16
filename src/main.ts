import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import * as jwt from 'jsonwebtoken';
import { secretKey } from './app.controller';
import { DnsLookupService } from './dns/dns.service';

const dnsChecker = new DnsLookupService();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    standardHeaders: false, // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    limit: async (req) => {
        if (req['token']) {
            return 25;
        } else {
            return 7;
        }
    },
    handler: async (request, response, next) => {
        const ip = (request.query?.ip as string | undefined) ?? 'shared';

        const result = await dnsChecker.isBot(ip);
        if (result) {
            console.log(`granted for ${ip}`);
            return next();
        } else {
            console.log(`429 for ${ip}`);
            return response.status(429).send();
        }
    },
    keyGenerator: (req) => {
        const token = req.query?.token as string | undefined;
        const ip = (req.query?.ip as string | undefined) ?? 'shared';
        dnsChecker.isBot(ip);
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
                    console.log('jwt expired');
                    const data = jwt.decode(token) as { uuid: string };
                    req['uuid'] = data.uuid;
                    req['isTokenValid'] = true;
                    if (data.uuid) {
                        return data.uuid;
                    }
                }
                req['token'] = false;
                console.log(`Error in verify: ` + e?.message);
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
