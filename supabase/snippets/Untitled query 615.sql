SELECT s.id, s.corso_id, c.nome, s.docente_cf, s.data, s.ora_inizio, s.ora_fine
FROM sessione s
JOIN corso c ON c.id = s.corso_id
WHERE s.stato = 'Bozza'
ORDER BY s.corso_id, s.data;

DELETE FROM sessione WHERE stato = 'Bozza';