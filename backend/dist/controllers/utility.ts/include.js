"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInclude = buildInclude;
function buildInclude(req, map) {
    return Object.fromEntries(String(req.query.include ?? '')
        .split(',')
        .filter((r) => Object.hasOwn(map, r))
        .map((r) => [r, map[r]]));
}
