"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async loginWithTelegram(initData) {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        if (!hash) {
            throw new common_1.UnauthorizedException('Missing hash');
        }
        params.delete('hash');
        const dataCheckString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN is not configured');
        }
        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const hmac = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        if (hmac !== hash) {
            throw new common_1.UnauthorizedException('Invalid Telegram signature');
        }
        const userJson = params.get('user');
        let user = null;
        if (userJson) {
            try {
                user = JSON.parse(userJson);
            }
            catch (e) {
                throw new common_1.UnauthorizedException('Invalid user JSON');
            }
        }
        const authDate = params.get('auth_date');
        const queryId = params.get('query_id');
        if (!user || !user.id) {
            throw new common_1.UnauthorizedException('User data missing');
        }
        const client = this.supabase.getClient();
        const { data, error } = await client
            .from('users')
            .upsert({
            tg_id: user.id,
            username: user.username ?? null,
            first_name: user.first_name ?? null,
            last_name: user.last_name ?? null,
            language_code: user.language_code ?? null,
            is_premium: user.is_premium ?? null,
            photo_url: user.photo_url ?? null,
            last_seen_at: new Date().toISOString(),
        }, {
            onConflict: 'tg_id',
        })
            .select()
            .single();
        if (error) {
            console.error('Supabase upsert error:', error);
            throw new Error('Failed to upsert user in Supabase');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not configured');
        }
        const token = jwt.sign({
            sub: data.id,
            tg_id: data.tg_id,
            username: data.username,
        }, jwtSecret, { expiresIn: '7d' });
        return {
            ok: true,
            auth_date: authDate,
            query_id: queryId,
            tgUser: user,
            dbUser: data,
            token,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map