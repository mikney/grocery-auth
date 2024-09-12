import { Const } from '../const/const';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Utils {
    export const getDateRelative = (days: number) =>
        new Date(
            new Date().getTime() - days * Const.TIME_ONE_DAY,
        ).toISOString();

    export const getByDate = (days: number) => ({
        date: {
            $gte: getDateRelative(days + 1),
            $lt: getDateRelative(days),
        },
    });
}
