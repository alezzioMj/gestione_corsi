import type { Request } from 'express';


export type IncludeMap = Record<string, true | object>;

export function buildInclude(req: Request, map: IncludeMap) {
  return Object.fromEntries(
    String(req.query.include ?? '')
      .split(',')
      .filter((r) =>  Object.hasOwn(map, r))
      .map((r) => [r, map[r]])
  );
}