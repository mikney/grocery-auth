import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { Utils } from '../utils/utils';

@Injectable()
export class ParsingService {
    authToken = '';
    initialTime = { hours: 6, minutes: 30 };
    parsingInterval: number = 0;
    instanceId = 'fv41k2lqgenvk4p01hg6';

    constructor(private prisma: PrismaService) {
        // this.getAuthTokenLoop().then(() => {
        //     this.parsingLoop();
        // });
    }

    async getAuthTokenLoop() {
        await this.getAuthToken();
        setInterval(
            () => {
                this.getAuthToken();
            },
            60 * 60 * 1000,
        );
    }

    parsingLoop() {
        function setTimeZone1(dateTime: Date, timeZone = '-03:00') {
            const string = new Date(dateTime).toISOString();
            return new Date(Date.parse(string.slice(0, -1) + timeZone));
        }
        const actualData = setTimeZone1(new Date());
        const { hours, minutes } = this.initialTime;

        if (
            actualData.getUTCHours() > hours ||
            (actualData.getUTCHours() === hours &&
                actualData.getMinutes() > minutes)
        ) {
            this.checkIsParsingEndLoop();
        }
        const interval = setInterval(() => {
            const actualData = setTimeZone1(new Date());

            if (
                actualData.getUTCHours() === hours &&
                actualData.getMinutes() === minutes
            ) {
                this.checkIsParsingEndLoop();
            }
        }, 60 * 1000);
        this.parsingInterval = interval as unknown as number;
    }

    async checkIsParsingEndLoop() {
        const interval = setInterval(async () => {
            const isParsingEnd = await this.isParsingEnd();
            if (isParsingEnd) {
                console.log('try to STOP VM parsing');
                this.stopParsingVM();
                clearInterval(interval);
            } else {
                const data = await this.checkVMStatus();
                if (data.status !== 'RUNNING') {
                    console.log('try to RUN VM parsing');
                    this.startParsingVM();
                }
            }
        }, 60 * 1000);
    }
    async isParsingEnd() {
        const data = await this.prisma.parsers.findFirst({
            where: {
                date: {
                    gte: Utils.getByDate(0).date.$gte,
                    lt: Utils.getByDate(0).date.$lt,
                },
            },
        });

        return data?.parsingEnd;
    }

    async startParsingVM() {
        const response = await axios.post<{ error: any }>(
            `https://compute.api.cloud.yandex.net/compute/v1/instances/${this.instanceId}:start`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${this.authToken}`,
                },
            },
        );
        return response.data;
    }

    async checkVMStatus() {
        const response = await axios.get<{ status: string | 'RUNNING' }>(
            `https://compute.api.cloud.yandex.net/compute/v1/instances/${this.instanceId}`,
            {
                headers: {
                    Authorization: `Bearer ${this.authToken}`,
                },
            },
        );
        return response.data;
    }
    async stopParsingVM() {
        const response = await axios.post<{ error: any }>(
            `https://compute.api.cloud.yandex.net/compute/v1/instances/${this.instanceId}:stop`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${this.authToken}`,
                },
            },
        );
        return response.data;
    }

    getAuthToken() {
        const data = JSON.stringify({
            yandexPassportOauthToken:
                'y0_AgAAAAB05_HFAATuwQAAAAD-sYR1AAAw1qVeJR9JTp9J282qg-FY5Hs4ag',
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        };

        return axios
            .request<{ iamToken: string }>(config)
            .then((response) => {
                this.authToken = response.data.iamToken;
            })
            .catch((error) => {
                console.log(error);
            });
    }
}
