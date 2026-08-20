import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmiofonpvqhrhnzhfoeo.supabase.co';
const supabaseAnonKey = 'sb_publishable_qAojSMIzENPN27nB0L2ApQ_4YF865ah';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
