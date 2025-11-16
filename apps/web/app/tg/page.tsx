'use client';

import { useEffect, useState } from 'react';

export default function TelegramAuthPage() {
  const [status, setStatus] = useState('Ініціалізація Telegram WebApp...');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      setStatus('❌ Не вдалося знайти Telegram WebApp API');
      return;
    }

    tg.ready();
    setStatus('Telegram WebApp знайдено ✔');

    const initData = tg.initData;
    if (!initData) {
      setStatus('❌ Немає initData — відкрий через Telegram');
      return;
    }

    const payload = { initData };

    setStatus('Авторизація...');

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t);
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setStatus('Авторизовано ✔');
      })
      .catch((err) => {
        console.error(err);
        setStatus('❌ Помилка авторизації');
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center h-screen p-4 text-white">
      <div className="text-2xl font-bold mb-4">SeraphAI</div>

      <div className="mb-6 text-lg">{status}</div>

      {user && (
        <div className="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur text-left">
          <div>id: {user.id}</div>
          <div>tg_id: {user.tg_id}</div>
          <div>
            {user.first_name} {user.last_name}
          </div>
          <div>@{user.username}</div>
          <div>{user.language_code}</div>
        </div>
      )}
    </main>
  );
}
