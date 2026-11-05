"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuliByMateriale = exports.deleteMateriale = exports.updateMateriale = exports.createMateriale = exports.getMateriale = exports.getMateriali = exports.supabase = void 0;
const prisma_1 = require("../prisma");
const supabase_js_1 = require("@supabase/supabase-js");
require("dotenv/config");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const getMateriali = async (req, res) => {
    try {
        const materiali = await prisma_1.prisma.materiale.findMany();
        const bucket = "Materiali";
        const paths = materiali.map((m) => m.storageKey);
        const { data, error } = await exports.supabase.storage
            .from(bucket)
            .createSignedUrls(paths, 3600);
        if (error || !data)
            throw error;
        const materialiConUrl = materiali.map((m, i) => ({
            ...m,
            url: data[i].signedUrl ?? '',
        }));
        res.json(materialiConUrl);
    }
    catch (error) {
        console.error("Errore nel recupero dei materiali:", error);
        res.status(500).send("Errore del server");
    }
};
exports.getMateriali = getMateriali;
