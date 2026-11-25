"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.BUCKET_MATERIALI = void 0;
require("dotenv/config");
const supabase_js_1 = require("@supabase/supabase-js");
exports.BUCKET_MATERIALI = "Materiali";
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
