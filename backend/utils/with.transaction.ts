import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type TxOptions = {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
};

export async function withTransaction<T>(
    tx: Prisma.TransactionClient | undefined,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: TxOptions,
): Promise<T> {
    if (tx) return fn(tx);
    return prisma.$transaction(fn, options);
}

const MAX_RETRY = 3;

export async function conRetry<T>(fn: () => Promise<T>, maxRetry = MAX_RETRY): Promise<T> {
    for (let tentativo = 1; ; tentativo++) {
        try {
            return await fn();
        } catch (err) {
            const serializzazione =
                err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034";
            if (!serializzazione || tentativo >= maxRetry) throw err;
        }
    }
}