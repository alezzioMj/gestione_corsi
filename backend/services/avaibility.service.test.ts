import { describe, it, expect, test } from 'vitest'
import { checkDocenteDisponibileMemoria, checkAulaDisponibileMemoria } from "../services/availability.service";

describe("checkDocenteDisponibileMemoria", () => {
  it("blocca un docente già occupato nello stesso intervallo, anche in sedi diverse", () => {
    const sessioniEsistenti = [
      {
        docente_cf: "RSSMRA85M01H501U",
        data: new Date("2026-01-10T00:00:00.000Z"),
        ora_inizio: "09:00",
        ora_fine: "11:00",
        sede_id: 1,
        aula_id: 1,
      },
    ] as any;

    expect(() =>
      checkDocenteDisponibileMemoria(
        "RSSMRA85M01H501U",
        new Date("2026-01-10T00:00:00.000Z"),
        "10:30",
        "12:00",
        2,
        sessioniEsistenti
      )
    ).toThrow("Il docente è già occupato in questo slot");
  });
});

describe("checkAulaDisponibileMemoria", () => {
  it("blocca un'aula se già occupata nello stesso intervallo", () => {
    const sessioniEsistenti = [
      {
        data: new Date("2026-01-10T00:00:00.000Z"),
        ora_inizio: "09:00",
        ora_fine: "11:00",
        aula_id: 1,
      },
    ];

    expect(() =>
      checkAulaDisponibileMemoria(
        1,
        new Date("2026-01-10T00:00:00.000Z"),
        "10:30",
        "12:00",
        sessioniEsistenti
      )
    ).toThrow("L'aula è già occupata in questo slot");
  });
});