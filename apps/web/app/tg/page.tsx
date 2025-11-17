'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ApiResponse = {
  user: any;
  telegram: any;
  token: string;
  meta: {
    ok: boolean;
    auth_date?: string | null;
    query_id?: string | null;
  };
};

type Phase = 'init' | 'auth' | 'success' | 'error';

export default function TelegramAuthPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('init');
  const [status, setStatus] = useState('Ініціалізація…');
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isLoading = phase === 'init' || phase === 'auth';

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === 'undefined') {
          setPhase('error');
          setStatus('Клієнтське середовище недоступне');
          return;
        }

        const w: any = window;
        const tgObj = w.Telegram;
        const tgWebApp = tgObj?.WebApp;

        if (!tgWebApp) {
          setPhase('error');
          setStatus('Не вдалося ініціалізувати Telegram WebApp');
          setError('Telegram WebApp API не знайдено. Відкрий бота як WebApp, а не в браузері.');
          return;
        }

        setPhase('auth');
        setStatus('Підключення до Telegram…');
        tgWebApp.ready();

        const initData: string | undefined = tgWebApp.initData;
        if (!initData) {
          setPhase('error');
          setStatus('Не отримано дані авторизації від Telegram');
          setError('initData порожній. Спробуй перезапустити WebApp.');
          return;
        }

        if (!apiUrl) {
          setPhase('error');
          setStatus('Помилка конфігурації');
          setError('NEXT_PUBLIC_API_URL не заданий.');
          return;
        }

        setStatus('Перевірка підпису та вхід…');

        const res = await fetch(`${apiUrl}/auth/telegram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data: ApiResponse = await res.json();

        if (data.token) {
          sessionStorage.setItem('seraphai_token', data.token);
        }

        const fullName =
          (data.user?.first_name || '') + (data.user?.last_name ? ` ${data.user.last_name}` : '');

        setUserName(fullName || data.user?.username || 'Користувач');
        setPhase('success');
        setStatus('Авторизовано ✔');

        setTimeout(() => {
          router.replace('/app');
        }, 700);
      } catch (e: any) {
        console.error(e);
        setPhase('error');
        setStatus('Помилка авторизації');
        setError(e?.message || String(e));
      }
    })();
  }, [apiUrl, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 text-white">
      <div className="w-full max-w-md px-5">
        {/* Логотип + заголовок */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-white/10 backdrop-blur shadow-[0_18px_45px_rgba(0,0,0,0.45)] mb-3 border border-white/15">
            <span className="text-2xl">🕊️</span>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight">SeraphAI</h1>
          <p className="mt-2 text-xs text-violet-100/70">
            Наступне покоління AI-помічника всередині Telegram
          </p>
        </div>

        {/* Карточка статусу */}
        <div className="rounded-3xl bg-black/40 border border-white/10 shadow-xl backdrop-blur-xl px-5 py-4 space-y-4 relative overflow-hidden">
          {/* Легка градієнтна підсвітка в кутку */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -top-24 -right-20 h-40 w-40 rounded-full bg-violet-500/40 blur-3xl" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/25 border border-violet-300/40">
              {isLoading && (
                <span className="h-4 w-4 border-2 border-violet-200 border-t-transparent rounded-full animate-spin" />
              )}
              {phase === 'success' && !isLoading && <span className="text-lg">✅</span>}
              {phase === 'error' && <span className="text-lg">⚠️</span>}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium leading-snug">{status}</p>

              {userName && phase === 'success' && (
                <p className="text-xs text-violet-100/75 mt-1">
                  Вітаю, <span className="font-semibold">{userName}</span>. Перенаправляємо в
                  SeraphAI…
                </p>
              )}

              {isLoading && (
                <p className="text-xs text-violet-100/60 mt-1">
                  Це займе кілька секунд. Не закривай вікно WebApp.
                </p>
              )}
            </div>
          </div>

          {/* Прогрес-лід (візуальна полоска зверху) */}
          <div className="relative h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 transition-all duration-500 ${
                phase === 'success' ? 'w-full' : phase === 'error' ? 'w-0' : 'w-2/3 animate-pulse'
              }`}
            />
          </div>

          {phase === 'error' && error && (
            <div className="relative mt-1 text-[11px] text-rose-50/90 bg-rose-500/10 border border-rose-400/40 rounded-2xl px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Футер з текстом безпеки */}
        <p className="mt-5 text-center text-[10px] leading-relaxed text-violet-100/55">
          Дані Telegram використовуються лише для верифікації особистості в SeraphAI.
          <br />
          Історія чатів не зчитується і не зберігається без твоєї згоди.
        </p>
      </div>
    </main>
  );
}
