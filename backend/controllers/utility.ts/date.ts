// Le colonne @db.Date vogliono una Date o una ISO completa, non "2026-11-23".
// undefined/null/"" passano invariati (undefined = campo ignorato da Prisma).
export const toDate = (v: any): any => (v ? new Date(v) : v);
