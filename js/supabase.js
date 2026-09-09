// ==========================================
// SUPABASE CONNECTION
// UNIVERSITY OF ELDORET SCHOOL OF SCIENCE
// ==========================================

const SUPABASE_URL = "https://ancaijwogjqguubzgmcj.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_lW4r8zSI4B2UjXBpRnK6dw_S1_WrNDb";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);