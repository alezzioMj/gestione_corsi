"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const availability_service_1 = require("../services/availability.service");
(0, vitest_1.describe)("checkDocenteDisponibileMemoria", () => {
    (0, vitest_1.it)("blocca un docente già occupato nello stesso intervallo, anche in sedi diverse", () => {
        const sessioniEsistenti = [
            {
                docente_cf: "RSSMRA85M01H501U",
                data: new Date("2026-01-10T00:00:00.000Z"),
                ora_inizio: "09:00",
                ora_fine: "11:00",
                sede_id: 1,
                aula_id: 1,
            },
        ];
        (0, vitest_1.expect)(() => (0, availability_service_1.checkDocenteDisponibileMemoria)("RSSMRA85M01H501U", new Date("2026-01-10T00:00:00.000Z"), "10:30", "12:00", 2, sessioniEsistenti)).toThrow("Il docente è già occupato in questo slot");
    });
});
(0, vitest_1.describe)("checkAulaDisponibileMemoria", () => {
    (0, vitest_1.it)("blocca un'aula se già occupata nello stesso intervallo", () => {
        const sessioniEsistenti = [
            {
                data: new Date("2026-01-10T00:00:00.000Z"),
                ora_inizio: "09:00",
                ora_fine: "11:00",
                aula_id: 1,
            },
        ];
        (0, vitest_1.expect)(() => (0, availability_service_1.checkAulaDisponibileMemoria)(1, new Date("2026-01-10T00:00:00.000Z"), "10:30", "12:00", sessioniEsistenti)).toThrow("L'aula è già occupata in questo slot");
    });
});
