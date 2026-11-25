import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export async function withTransaction<T>(
    tx: Prisma.TransactionClient | undefined,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
): Promise<T> {
    if (tx) return fn(tx);

    return prisma.$transaction(fn, options);
}