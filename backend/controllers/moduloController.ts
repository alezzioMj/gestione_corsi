import 'dotenv/config';
import { prisma } from "../prisma";
import express from "express";
import { getDocenti } from "./docenteController";
import { getMateriale } from "./materialeController";
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la Service Role per bypassare le RLS nel backend
export const supabase = createClient(supabaseUrl, supabaseKey)



const getModuli = async (req: express.Request, res: express.Response) => {
  try {
    const moduli = await prisma.modulo.findMany({
      select: { // Ensure these fields are selected for the frontend calculation
        id: true,
        titolo: true,
        n_ore: true,
        competenza: true,
      }});
    res.json(moduli);
  } catch (error) {
    console.error("Errore nel recupero dei moduli:", error);
    res.status(500).send("Errore del server");
  }
};

const getModulo = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const modulo = await prisma.modulo.findUnique({
      where: { id },
    });

    if (!modulo) {
      return res.status(404).send("Modulo non trovato");
    }

    res.json(modulo);
  } catch (error) {
    console.error("Errore nel recupero del modulo:", error);
    res.status(500).send("Errore del server");
  }
};

const createModulo = async (req: express.Request, res: express.Response) => {
  try {
    const {
      titolo,
      n_ore,
      competenza
    } = req.body;

    const modulo = await prisma.modulo.create({
      data: {
        titolo,
        n_ore: Number(n_ore), // Ensure it's a number
        competenza
      }
    });

    res.status(201).json(modulo);
  } catch (err: any) {
    console.error({
      message: "Errore nella creazione del modulo",
      error: err,
    });
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Il modulo esiste già" });
    }
    res.status(500).json({ error: "Errore creazione modulo" });
  }
};

const updateModulo = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    const {
      titolo,
      n_ore,
      competenza
    } = req.body;

    const modulo = await prisma.modulo.update({
      where: { id },
      data: {
        titolo,
        n_ore,
        competenza
      }
    });

    res.json(modulo);
  } catch (err: any) {
    console.error({
      message: "Errore nell'aggiornamento del modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore aggiornamento modulo" });
  }
};

const deleteModulo = async (req: express.Request, res: express.Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.modulo.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err: any) {
    console.error({
      message: "Errore nella cancellazione del modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore cancellazione moduolo" });
  }
};

const getDocentiByModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const docenti = await prisma.docente_modulo.findMany({
      where: { modulo_id },
      include: {
        docente: true
      }
    })

    if (docenti.length === 0) {
      return res.status(404).send("Nessun docente trovato per questo modulo");
    }
    res.json(docenti)

  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei docenti per questo corso",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca docenti" });
  }
}

const getMaterialeByModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const materiali = await prisma.modulo_materiale.findMany({
      where: {
        modulo_id
      },
      include: {
        materiale: true
      }
    })

    if (materiali.length === 0) {
      return res.status(404).send("Nessun materiale trovato per questo modulo");
    }
    res.json(materiali);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca del materiale per questo modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca materiale" });
  }
}

const addMaterialeToModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const { materiale_id } = req.body;

    const relazione = await prisma.modulo_materiale.create({
      data: {
        modulo_id,
        materiale_id
      }
    });

    res.status(201).json(relazione);
  } catch (err: any) {
    console.error("Errore assegnazione materiale al modulo", err);
    res.status(500).json({ error: "Errore assegnazione materiale" });
  }
}

const deleteMaterialeFromModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const materiale_id = Number(req.params.materiale_id);

    const relazione = await prisma.modulo_materiale.delete({
      where: {
        modulo_id_materiale_id: {
          modulo_id,
          materiale_id,
        },
      },
    });
    res.status(201).json(relazione);
  } catch (err: any) {
    console.error("Errore cancellazione materiale dal modulo", err);
    res.status(500).json({ error: "Errore cancellazione modulo" });
  }
}

const getProgrammiByModulo = async (req: express.Request, res: express.Response) => {
  try {
    const modulo_id = Number(req.params.id);
    const programmi = await prisma.programma_modulo.findMany({
      where: {
        modulo_id
      },
      include: {
        programma: true
      }
    })

    if (programmi.length === 0) {
      return res.status(404).send("Nessun programma trovato per questo modulo");
    }
    res.json(programmi);
  } catch (err: any) {
    console.error({
      message: "Errore nella ricerca dei programmi per questo modulo",
      error: err,
    });
    res.status(500).json({ error: "Errore ricerca programmi" });
  }
}

const uploadCompleteModulo = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) return res.status(400).send("File mancante.");

    const { titolo, n_ore, descrizioneMateriale, competenza } = req.body;
    const file = req.file;

    // Upload su Supabase
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Materiali')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('Materiali')
      .getPublicUrl(fileName);

    // Transazione Prisma Crea Modulo, Materiale e Associazione
    const result = await prisma.$transaction(async (tx) => {
      const nuovoModulo = await tx.modulo.create({
        data: {
          titolo,
          n_ore: Number(n_ore),
          competenza: competenza
        }
      });

      // Crea il materiale
      const nuovoMateriale = await tx.materiale.create({
        data: {
          url: publicUrlData.publicUrl,
          file_name: file.originalname,
          tipo: file.mimetype,
          descrizione: descrizioneMateriale || `Materiale per ${titolo}`
        }
      });

      // Crea il collegamento nella tabella pivot
      await tx.modulo_materiale.create({
        data: {
          modulo_id: nuovoModulo.id,
          materiale_id: nuovoMateriale.id
        }
      });

      return nuovoModulo;
    });

    res.status(201).json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Errore durante la creazione completa" });
  }
};

export {
  getModuli,
  getModulo,
  createModulo,
  updateModulo,
  deleteModulo,
  getDocentiByModulo,
  getMaterialeByModulo,
  addMaterialeToModulo,
  deleteMaterialeFromModulo,
  getProgrammiByModulo,
  uploadCompleteModulo
};
