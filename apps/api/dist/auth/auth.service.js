"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const telegram_auth_util_1 = require("../telegram/telegram-auth.util");
let AuthService = class AuthService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async authWithTelegram(dto) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN is not set');
        }
        const { ok, error, user } = (0, telegram_auth_util_1.verifyTelegramInitData)(dto.initData, botToken);
        if (!ok || !user) {
            throw new common_1.UnauthorizedException(error || 'Invalid Telegram initData');
        }
        const dbUser = await this.supabase.upsertTelegramUser({
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            language_code: user.language_code,
            photo_url: user.photo_url,
            is_premium: user.is_premium,
        });
        return {
            user: {
                id: dbUser.id,
                tg_id: dbUser.tg_id,
                username: dbUser.username,
                first_name: dbUser.first_name,
                last_name: dbUser.last_name,
                language_code: dbUser.language_code,
                is_premium: dbUser.is_premium,
                created_at: dbUser.created_at,
                last_login_at: dbUser.last_login_at,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map