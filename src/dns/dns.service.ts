import { Injectable } from '@nestjs/common';
import * as dns from 'dns';
import * as NodeCache from 'node-cache';

@Injectable()
export class DnsLookupService {
    private cache = new NodeCache({ stdTTL: 3600 * 24, checkperiod: 3600 });

    constructor() {}

    // Method to perform a reverse DNS lookup asynchronously
    async reverseDnsLookup(ip: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            dns.reverse(ip, (err, hostnames) => {
                if (err) {
                    return reject(err);
                }
                resolve(hostnames);
            });
        });
    }

    // Method to check if the IP belongs to Googlebot or Yandexbot
    async isBot(ip: string): Promise<boolean> {
        const cachedResult = this.cache.get<boolean>(ip);
        if (cachedResult) {
            return cachedResult;
        }

        try {
            const hostnames = await this.reverseDnsLookup(ip);
            const isGooglebot = hostnames.some(
                (hostname) =>
                    hostname.endsWith('.googlebot.com') ||
                    hostname.endsWith('.googleusercontent.com') ||
                    hostname.endsWith('.google.com'),
            );
            const isYandexBot = hostnames.some(
                (hostname) =>
                    hostname.endsWith('.yandex.com') ||
                    hostname.endsWith('.yandex.net') ||
                    hostname.endsWith('.yandex.ru'),
            );
            if (isGooglebot) {
                console.log('google bot');
            }

            if (isYandexBot) {
                console.log('yandex bot');
            }

            const result = isGooglebot || isYandexBot;
            this.cache.set(ip, result);
            return result;
        } catch (error) {
            return false;
        }
    }
}
