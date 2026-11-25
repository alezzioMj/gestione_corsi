"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = withTransaction;
const prisma_1 = require("../prisma");
async function withTransaction(tx, fn, options) {
    if (tx)
        return fn(tx);
    return prisma_1.prisma.$transaction(fn, options);
}
