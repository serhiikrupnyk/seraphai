"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = class SupabaseService {
    client;
    onModuleInit() {
        const url = process.env.SUPABASE_URL;
        const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
        if (!url || !serviceRole) {
            throw new Error('Supabase env vars not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE)');
        }
        this.client = (0, supabase_js_1.createClient)(url, serviceRole, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        console.log('🟢 Supabase client initialized');
    }
    getClient() {
        return this.client;
    }
    async upsertTelegramUser(payload) {
        const now = new Date().toISOString();
        const { data, error } = await this.client
            .from('users')
            .upsert({
            tg_id: payload.id,
            username: payload.username ?? null,
            first_name: payload.first_name ?? null,
            last_name: payload.last_name ?? null,
            language_code: payload.language_code ?? null,
            photo_url: payload.photo_url ?? null,
            is_premium: payload.is_premium ?? false,
            last_login_at: now,
        }, {
            onConflict: 'tg_id',
        })
            .select('*')
            .single();
        if (error) {
            console.error('Supabase upsertTelegramUser error:', error);
            throw new Error('Failed to upsert Telegram user in Supabase');
        }
        return data;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)()
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map