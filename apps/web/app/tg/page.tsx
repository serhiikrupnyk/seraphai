'use client';

import { useEffect, useState } from 'react';

type DebugInfo = {
  hasWindow: boolean;
  hasTelegram: boolean;
  hasWebApp: boolean;
  telegramKeys: string[];
  href: string;
};

type ApiUser = {
  id: number;
  tg_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  is_premium: boolean | null;
  photo_url: string | null;
};

type ApiResponse = {
  user: ApiUser;
  telegram: any;
  token: string;
  meta: {
    ok: boolean;
    auth_date?: string;
    query_id?: string;
  };
};

export default function TelegramAuthPage() {
  const [status, setStatus] = useState('Ініціалізація...');
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    try {
      if (typeof window === 'undefined') {
        setStatus('window недоступний');
        return;
      }

      const w: any = window;
      const tgObj = w.Telegram;
      const tgWebApp = tgObj?.WebApp;

      const info: DebugInfo = {
        hasWindow: true,
        hasTelegram: !!tgObj,
        hasWebApp: !!tgWebApp,
        telegramKeys: tgObj ? Object.keys(tgObj) : [],
        href: window.location.href,
      };
      setDebug(info);

      if (!tgWebApp) {
        setStatus('❌ Не вдалося знайти Telegram WebApp API');
        return;
      }

      setStatus('Telegram WebApp знайдено ✔');
      tgWebApp.ready();

      const initData: string | undefined = tgWebApp.initData;
      if (!initData) {
        setStatus('❌ Немає initData від Telegram');
        return;
      }

      if (!apiUrl) {
        setStatus('❌ NEXT_PUBLIC_API_URL не налаштований');
        return;
      }

      setStatus('Авторизація...');

      fetch(`${apiUrl}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data: ApiResponse) => {
          setProfile(data.user);
          setToken(data.token);
          setStatus('Авторизовано ✔');
        })
        .catch((err) => {
          console.error(err);
          setError(String(err));
          setStatus('❌ Помилка авторизації');
        });
    } catch (e: any) {
      console.error(e);
      setError(String(e));
      setStatus('❌ Фатальна помилка на клієнті');
    }
  }, [apiUrl]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">SeraphAI</h1>

      <div className="mb-4 text-lg">{status}</div>

      {error && <div className="mb-4 text-red-400 text-sm break-words">Помилка: {error}</div>}

      {profile && (
        <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur text-left w-full max-w-md">
          <div className="font-semibold mb-2">Профіль:</div>
          <div>id: {profile.id}</div>
          <div>tg_id: {profile.tg_id}</div>
          <div>
            {profile.first_name} {profile.last_name}
          </div>
          <div>@{profile.username}</div>
          <div>lang: {profile.language_code}</div>
          {profile.is_premium && <div>Telegram Premium ✔</div>}
        </div>
      )}

      {token && (
        <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur text-left w-full max-w-md text-xs break-words">
          <div className="font-semibold mb-2">Сесія SeraphAI:</div>
          <div>
            JWT отримано (довжина: {token.length}). Надалі будемо відправляти його в заголовку{' '}
            <code>Authorization: Bearer ...</code>.
          </div>
        </div>
      )}

      {debug && (
        <div className="mt-6 p-3 rounded-xl bg-white/5 text-xs w-full max-w-md break-words">
          <div className="font-semibold mb-1">Debug info:</div>
          <div>apiUrl: {apiUrl || '<not set>'}</div>
          <div>hasWindow: {String(debug.hasWindow)}</div>
          <div>hasTelegram: {String(debug.hasTelegram)}</div>
          <div>hasWebApp: {String(debug.hasWebApp)}</div>
          <div>telegramKeys: {debug.telegramKeys.join(', ') || '<none>'}</div>
          <div>href: {debug.href}</div>
        </div>
      )}
    </main>
  );
}
