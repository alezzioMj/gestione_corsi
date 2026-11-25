"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDate = void 0;
// Le colonne @db.Date vogliono una Date o una ISO completa, non "2026-11-23".
// undefined/null/"" passano invariati (undefined = campo ignorato da Prisma).
const toDate = (v) => (v ? new Date(v) : v);
exports.toDate = toDate;
