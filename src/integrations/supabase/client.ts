// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lsjeuwtmeroikonujwgt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzamV1d3RtZXJvaWtvbnVqd2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDgzMTAsImV4cCI6MjA2NTM4NDMxMH0.lBwXA1PtCo5DpWkRU7DxJ7ST4roFV34GO3uCVYYs5Kw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);