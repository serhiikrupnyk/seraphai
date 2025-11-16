'use client';

import { useEffect, useState } from 'react';

type DebugInfo = {
  hasWindow: boolean;
  hasTelegram: boolean;
  hasWebApp: boolean;
  telegramKeys: string[];
  href: string;
};

export default function TelegramAuthPage() {
  const [status, setStatus] = useState('Ініціалізація...');
  const [user, setUser] = useState<any>(null);
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
            const t = await res.text();
            throw new Error(t || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setUser(data.user);
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
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">SeraphAI</h1>

      <div className="mb-4 text-lg">{status}</div>

      {error && <div className="mb-4 text-red-400 text-sm break-words">Помилка: {error}</div>}

      {user && (
        <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur text-left w-full max-w-md">
          <div className="font-semibold mb-2">Профіль:</div>
          <div>id: {user.id}</div>
          <div>tg_id: {user.tg_id}</div>
          <div>
            {user.first_name} {user.last_name}
          </div>
          <div>@{user.username}</div>
          <div>lang: {user.language_code}</div>
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
