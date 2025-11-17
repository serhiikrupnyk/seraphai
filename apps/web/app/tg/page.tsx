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

        // Зберігаємо JWT в межах сесії WebApp
        if (data.token) {
          sessionStorage.setItem('seraphai_token', data.token);
        }

        const fullName =
          (data.user?.first_name || '') + (data.user?.last_name ? ` ${data.user.last_name}` : '');
        setUserName(fullName || data.user?.username || 'Користувач');
        setPhase('success');
        setStatus('Авторизовано ✔');

        // Невелика пауза, щоб показати користувачу статус
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

  const isLoading = phase === 'init' || phase === 'auth';

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 text-white">
      <div className="w-full max-w-md px-5">
        {/* Логотип / заголовок */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur shadow-lg mb-3">
            <span className="text-xl">🕊️</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">SeraphAI</h1>
          <p className="mt-2 text-sm text-violet-100/70">Безпечний вхід через Telegram WebApp</p>
        </div>

        {/* Карточка статусу */}
        <div className="rounded-2xl bg-black/40 border border-white/10 shadow-xl backdrop-blur-xl px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20">
              {isLoading && (
                <span className="h-4 w-4 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" />
              )}
              {phase === 'success' && !isLoading && <span className="text-lg">✅</span>}
              {phase === 'error' && <span className="text-lg">⚠️</span>}
            </div>

            <div>
              <p className="text-sm font-medium">{status}</p>
              {userName && phase === 'success' && (
                <p className="text-xs text-violet-100/70 mt-0.5">
                  Вітаю, <span className="font-semibold">{userName}</span> — готуємо інтерфейс…
                </p>
              )}
              {isLoading && (
                <p className="text-xs text-violet-100/60 mt-0.5">
                  Це займе кілька секунд. Не закривай вікно.
                </p>
              )}
            </div>
          </div>

          {phase === 'error' && error && (
            <div className="mt-2 text-xs text-rose-100/80 bg-rose-500/10 border border-rose-400/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Нижній текст */}
        <p className="mt-4 text-center text-[11px] text-violet-100/50">
          Дані Telegram використовуються лише для входу в SeraphAI. Ніякі чати не читаються.
        </p>
      </div>
    </main>
  );
}
