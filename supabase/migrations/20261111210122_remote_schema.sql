ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

REVOKE ALL ON SCHEMA "public" FROM PUBLIC;

REVOKE ALL ON SCHEMA "public" FROM "anon";

REVOKE ALL ON SCHEMA "public" FROM "authenticated";

REVOKE ALL ON SCHEMA "public" FROM "pg_database_owner";

REVOKE ALL ON SCHEMA "public" FROM "service_role";

COMMENT ON SCHEMA "public" IS NULL;

CREATE SEQUENCE "public"."aula_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."aula_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."corso_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."corso_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."indisponibilita_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."indisponibilita_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."materiale_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."materiale_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."modulo_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."modulo_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."programma_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."programma_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."programma_modulo_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."programma_modulo_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."sede_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."sede_id_seq" FROM "anon", "authenticated", "service_role";

CREATE SEQUENCE "public"."sessione_id_seq" AS integer INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1 NO CYCLE;

REVOKE ALL ON SEQUENCE "public"."sessione_id_seq" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."_prisma_migrations" (
  "id"                  character varying(36)    NOT NULL,
  "checksum"            character varying(64)    NOT NULL,
  "finished_at"         timestamp with time zone,
  "migration_name"      character varying(255)   NOT NULL,
  "logs"                text,
  "rolled_back_at"      timestamp with time zone,
  "started_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "applied_steps_count" integer                  NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."_prisma_migrations" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."aula" (
  "id"          integer                NOT NULL DEFAULT nextval('public.aula_id_seq'::regclass),
  "nome"        character varying(100) NOT NULL,
  "sede_id"     integer                NOT NULL,
  "capienza"    integer,
  "descrizione" text,
  CONSTRAINT "aula_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."aula" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."corso_docente" (
  "corso_id"   integer               NOT NULL,
  "docente_cf" character varying(16) NOT NULL,
  "n_ore"      integer,
  CONSTRAINT "corso_docente_pkey" PRIMARY KEY (corso_id, docente_cf)
);

REVOKE ALL ON TABLE "public"."corso_docente" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."corso_sede" (
  "corso_id" integer NOT NULL,
  "sede_id"  integer NOT NULL,
  CONSTRAINT "corso_sede_pkey" PRIMARY KEY (corso_id, sede_id)
);

REVOKE ALL ON TABLE "public"."corso_sede" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."corso" (
  "id"                integer                        NOT NULL DEFAULT nextval('public.corso_id_seq'::regclass),
  "programma_id"      integer,
  "n_ore"             integer,
  "inizio"            date,
  "fine"              date,
  "mattina_inizio"    text                           NOT NULL,
  "mattina_fine"      text                           NOT NULL,
  "pomeriggio_inizio" text                           NOT NULL,
  "pomeriggio_fine"   text                           NOT NULL,
  "created_at"        timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
  "created_by"        character varying(100),
  "cliente"           character varying(150)         NOT NULL,
  "descrizione"       text,
  "nome"              character varying(150)         NOT NULL,
  CONSTRAINT "corso_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."corso" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."docente_modulo" (
  "docente_cf" character varying(16) NOT NULL,
  "modulo_id"  integer               NOT NULL,
  CONSTRAINT "docente_modulo_pkey" PRIMARY KEY (docente_cf, modulo_id)
);

REVOKE ALL ON TABLE "public"."docente_modulo" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."docente" (
  "codice_fiscale" character varying(16)          NOT NULL,
  "nome"           character varying(100)         NOT NULL,
  "cognome"        character varying(100)         NOT NULL,
  "datanascita"    date                           NOT NULL,
  "nazione"        character varying(100)         NOT NULL,
  "regione"        character varying(100)         NOT NULL,
  "provincia"      character varying(100)         NOT NULL,
  "comune"         character varying(100)         NOT NULL,
  "sesso"          character varying(20)          NOT NULL,
  "cellulare"      character varying(20)          NOT NULL,
  "mail"           character varying(100)         NOT NULL,
  "cv"             character varying(255)         NOT NULL,
  "contratto"      character varying(100)         NOT NULL,
  "created_at"     timestamp(6) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by"     character varying(100),
  "colore"         text                           NOT NULL DEFAULT '#1976d2'::text,
  CONSTRAINT "docente_pkey" PRIMARY KEY (codice_fiscale)
);

REVOKE ALL ON TABLE "public"."docente" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."indisponibilita" (
  "id"          integer                        NOT NULL DEFAULT nextval('public.indisponibilita_id_seq'::regclass),
  "docente_cf"  character varying(16),
  "sede_id"     integer,
  "data_inizio" date                           NOT NULL,
  "data_fine"   date                           NOT NULL,
  "ora_inizio"  text                           NOT NULL,
  "ora_fine"    text                           NOT NULL,
  "causale"     character varying(100)         NOT NULL,
  "descrizione" text,
  "created_at"  timestamp(6) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "aula_id"     integer,
  CONSTRAINT "indisponibilita_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."indisponibilita" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."materiale" (
  "id"          integer NOT NULL DEFAULT nextval('public.materiale_id_seq'::regclass),
  "descrizione" text,
  CONSTRAINT "materiale_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."materiale" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."modulo_materiale" (
  "modulo_id"    integer NOT NULL,
  "materiale_id" integer NOT NULL,
  CONSTRAINT "modulo_materiale_pkey" PRIMARY KEY (modulo_id, materiale_id)
);

REVOKE ALL ON TABLE "public"."modulo_materiale" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."modulo" (
  "id"     integer                NOT NULL DEFAULT nextval('public.modulo_id_seq'::regclass),
  "titolo" character varying(150) NOT NULL,
  "n_ore"  integer                DEFAULT 4,
  CONSTRAINT "modulo_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."modulo" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."programma_modulo" (
  "programma_id"  integer NOT NULL,
  "modulo_id"     integer NOT NULL,
  "ordine"        integer NOT NULL,
  "obbligatorio"  boolean DEFAULT true,
  "n_ripetizioni" integer NOT NULL DEFAULT 1,
  "id"            integer NOT NULL DEFAULT nextval('public.programma_modulo_id_seq'::regclass),
  CONSTRAINT "programma_modulo_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."programma_modulo" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."programma" (
  "id"              integer                        NOT NULL DEFAULT nextval('public.programma_id_seq'::regclass),
  "titolo"          character varying(150)         NOT NULL,
  "descrizione"     text,
  "durata_totale"   integer                        NOT NULL,
  "ore_pratiche"    integer                        NOT NULL,
  "ore_teoriche"    integer                        NOT NULL,
  "ore_trasversali" integer                        NOT NULL,
  "created_at"      timestamp(6) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by"      character varying(100),
  CONSTRAINT "programma_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."programma" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."sede" (
  "id"          integer                        NOT NULL DEFAULT nextval('public.sede_id_seq'::regclass),
  "nome"        character varying(150)         NOT NULL,
  "indirizzo"   character varying(150)         NOT NULL,
  "civico"      character varying(20)          NOT NULL,
  "cap"         character(5)                   NOT NULL,
  "citta"       character varying(100)         NOT NULL,
  "provincia"   character(2)                   NOT NULL,
  "descrizione" text,
  "created_at"  timestamp(6) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by"  character varying(100),
  CONSTRAINT "sede_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."sede" FROM "anon", "authenticated", "service_role";

CREATE TABLE "public"."sessione" (
  "id"         integer               NOT NULL DEFAULT nextval('public.sessione_id_seq'::regclass),
  "corso_id"   integer               NOT NULL,
  "docente_cf" character varying(16),
  "modulo_id"  integer               NOT NULL,
  "sede_id"    integer               NOT NULL,
  "aula_id"    integer,
  "data"       date                  NOT NULL,
  "ora_inizio" text                  NOT NULL,
  "ora_fine"   text                  NOT NULL,
  CONSTRAINT "sessione_pkey" PRIMARY KEY (id)
);

REVOKE ALL ON TABLE "public"."sessione" FROM "anon", "authenticated", "service_role";

ALTER SEQUENCE "public"."aula_id_seq" OWNED BY "public"."aula"."id";

ALTER SEQUENCE "public"."corso_id_seq" OWNED BY "public"."corso"."id";

ALTER SEQUENCE "public"."indisponibilita_id_seq" OWNED BY "public"."indisponibilita"."id";

ALTER SEQUENCE "public"."materiale_id_seq" OWNED BY "public"."materiale"."id";

ALTER SEQUENCE "public"."modulo_id_seq" OWNED BY "public"."modulo"."id";

ALTER SEQUENCE "public"."programma_id_seq" OWNED BY "public"."programma"."id";

ALTER SEQUENCE "public"."programma_modulo_id_seq" OWNED BY "public"."programma_modulo"."id";

ALTER SEQUENCE "public"."sede_id_seq" OWNED BY "public"."sede"."id";

ALTER SEQUENCE "public"."sessione_id_seq" OWNED BY "public"."sessione"."id";

CREATE TYPE "public"."CategoriaMateriale" AS ENUM (
  'SLIDE',
  'DISPENSA',
  'VIDEO',
  'ESERCIZI',
  'ALTRO'
);

ALTER TABLE "public"."materiale"
  ADD COLUMN "categoria" public."CategoriaMateriale" NOT NULL DEFAULT 'ALTRO'::public."CategoriaMateriale";

ALTER TABLE "public"."materiale"
  ADD COLUMN "checksum" text;

ALTER TABLE "public"."materiale"
  ADD COLUMN "createdAt" timestamp(3) WITHOUT time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."materiale"
  ADD COLUMN "mimeType" text NOT NULL;

ALTER TABLE "public"."materiale"
  ADD COLUMN "originalName" text NOT NULL;

ALTER TABLE "public"."materiale"
  ADD COLUMN "sizeBytes" integer NOT NULL;

ALTER TABLE "public"."materiale"
  ADD COLUMN "storageKey" text NOT NULL;

ALTER TABLE "public"."materiale"
  ADD COLUMN "titolo" text NOT NULL;

ALTER TABLE "public"."materiale"
  ADD COLUMN "uploadedById" text;

CREATE TYPE "public"."competenza_enum" AS ENUM (
  'Pratica',
  'Teorica',
  'Trasversale'
);

ALTER TABLE "public"."modulo"
  ADD COLUMN "competenza" public.competenza_enum NOT NULL;

ALTER TABLE "public"."modulo"
  ADD COLUMN "created_at" timestamp(6) WITHOUT time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."modulo"
  ADD COLUMN "created_by" character varying(100);

ALTER TABLE "public"."modulo"
  ADD COLUMN "multiplo" boolean DEFAULT false;

ALTER TABLE "public"."modulo"
  ADD COLUMN "descrizione" text;

CREATE TYPE "public"."stato_sessione_enum" AS ENUM (
  'Bozza',
  'Confermata',
  'Annullata',
  'Completata'
);

ALTER TABLE "public"."sessione"
  ADD COLUMN "stato" public.stato_sessione_enum DEFAULT 'Bozza'::public.stato_sessione_enum;

ALTER TABLE "public"."sessione"
  ADD COLUMN "priorita" integer NOT NULL;

ALTER TABLE "public"."sessione"
  ADD COLUMN "note" text;

ALTER TABLE "public"."sessione"
  ADD COLUMN "created_at" timestamp(6) WITHOUT time zone NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."sessione"
  ADD COLUMN "created_by" character varying(100);

ALTER TABLE "public"."corso_docente"
  ADD CONSTRAINT "corso_docente_corso_id_fkey" FOREIGN KEY (corso_id) REFERENCES public.corso(id) ON DELETE CASCADE;

ALTER TABLE "public"."corso_sede"
  ADD CONSTRAINT "corso_sede_corso_id_fkey" FOREIGN KEY (corso_id) REFERENCES public.corso(id) ON DELETE CASCADE;

ALTER TABLE "public"."corso_docente"
  ADD CONSTRAINT "corso_docente_docente_cf_fkey" FOREIGN KEY (docente_cf) REFERENCES public.docente(codice_fiscale) ON DELETE CASCADE;

ALTER TABLE "public"."docente_modulo"
  ADD CONSTRAINT "docente_modulo_docente_cf_fkey" FOREIGN KEY (docente_cf) REFERENCES public.docente(codice_fiscale) ON DELETE CASCADE;

ALTER TABLE "public"."indisponibilita"
  ADD CONSTRAINT "indisponibilita_aula_id_fkey" FOREIGN KEY (aula_id) REFERENCES public.aula(id);

ALTER TABLE "public"."indisponibilita"
  ADD CONSTRAINT "indisponibilita_docente_cf_fkey" FOREIGN KEY (docente_cf) REFERENCES public.docente(codice_fiscale);

ALTER TABLE "public"."docente_modulo"
  ADD CONSTRAINT "docente_modulo_modulo_id_fkey" FOREIGN KEY (modulo_id) REFERENCES public.modulo(id) ON DELETE CASCADE;

ALTER TABLE "public"."modulo_materiale"
  ADD CONSTRAINT "modulo_materiale_materiale_id_fkey" FOREIGN KEY (materiale_id) REFERENCES public.materiale(id) ON DELETE CASCADE;

ALTER TABLE "public"."modulo_materiale"
  ADD CONSTRAINT "modulo_materiale_modulo_id_fkey" FOREIGN KEY (modulo_id) REFERENCES public.modulo(id) ON DELETE CASCADE;

ALTER TABLE "public"."corso"
  ADD CONSTRAINT "corso_programma_id_fkey" FOREIGN KEY (programma_id) REFERENCES public.programma(id);

ALTER TABLE "public"."programma_modulo"
  ADD CONSTRAINT "programma_modulo_modulo_id_fkey" FOREIGN KEY (modulo_id) REFERENCES public.modulo(id) ON DELETE CASCADE;

ALTER TABLE "public"."programma_modulo"
  ADD CONSTRAINT "programma_modulo_programma_id_fkey" FOREIGN KEY (programma_id) REFERENCES public.programma(id) ON DELETE CASCADE;

ALTER TABLE "public"."aula"
  ADD CONSTRAINT "aula_sede_id_fkey" FOREIGN KEY (sede_id) REFERENCES public.sede(id);

ALTER TABLE "public"."corso_sede"
  ADD CONSTRAINT "corso_sede_sede_id_fkey" FOREIGN KEY (sede_id) REFERENCES public.sede(id) ON DELETE CASCADE;

ALTER TABLE "public"."indisponibilita"
  ADD CONSTRAINT "indisponibilita_sede_id_fkey" FOREIGN KEY (sede_id) REFERENCES public.sede(id);

ALTER TABLE "public"."sessione"
  ADD CONSTRAINT "sessione_aula_id_fkey" FOREIGN KEY (aula_id) REFERENCES public.aula(id) ON UPDATE SET NULL ON DELETE SET NULL;

ALTER TABLE "public"."sessione"
  ADD CONSTRAINT "sessione_corso_id_fkey" FOREIGN KEY (corso_id) REFERENCES public.corso(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."sessione"
  ADD CONSTRAINT "sessione_docente_cf_fkey" FOREIGN KEY (docente_cf) REFERENCES public.docente(codice_fiscale) ON UPDATE SET NULL ON DELETE SET NULL;

ALTER TABLE "public"."sessione"
  ADD CONSTRAINT "sessione_modulo_id_fkey" FOREIGN KEY (modulo_id) REFERENCES public.modulo(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE "public"."sessione"
  ADD CONSTRAINT "sessione_sede_id_fkey" FOREIGN KEY (sede_id) REFERENCES public.sede(id) ON UPDATE RESTRICT ON DELETE RESTRICT;

CREATE UNIQUE INDEX aula_nome_sede_id_key ON public.aula USING btree (nome, sede_id);

CREATE UNIQUE INDEX "materiale_storageKey_key" ON public.materiale USING btree ("storageKey");

CREATE UNIQUE INDEX programma_modulo_programma_id_ordine_key ON public.programma_modulo USING btree (programma_id, ordine);

CREATE UNIQUE INDEX sessione_docente_cf_data_ora_inizio_ora_fine_key ON public.sessione USING btree (docente_cf, DATA, ora_inizio, ora_fine);

REVOKE ALL ON SCHEMA "public" FROM "postgres";

GRANT CREATE, USAGE ON SCHEMA "public" TO "postgres";

