import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL or SUPABASE_SERVICE_ROLE is not configured',
      );
    }

    this.client = createClient(url, key);
  }

  getClient() {
    return this.client;
  }
}
