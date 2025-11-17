'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeraphAIMainPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = sessionStorage.getItem('seraphai_token');

    if (!stored) {
      // якщо немає токена – назад на авторизацію
      router.replace('/tg');
      return;
    }

    setToken(stored);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-white/70 text-sm">Перевірка сесії...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 text-white p-4">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">SeraphAI</h1>
          <p className="text-xs text-white/60">Твій AI-помічник всередині Telegram</p>
        </div>
        <div className="text-[10px] text-white/50 max-w-[130px] text-right">
          JWT активний
          <br />
          (зберігається в sessionStorage)
        </div>
      </header>

      {/* Main content */}
      <div className="grid gap-4">
        <section className="rounded-2xl bg-white/10 backdrop-blur p-4">
          <h2 className="text-lg font-semibold mb-2">Що вміє SeraphAI</h2>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• GPT-5 діалоги та персональний асистент</li>
            <li>• Генерація зображень та медіа (скоро)</li>
            <li>• Робота з документами та файлами (скоро)</li>
            <li>• Інкогніто-режим без збереження історії (пізніше)</li>
          </ul>
        </section>

        <section className="grid grid-cols-1 gap-3">
          {/* Картка чату */}
          <button
            className="rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/20 transition p-4 text-left"
            onClick={() => {
              // поки що просто заглушка – далі зробимо /chat
              alert('Далі тут буде окремий екран чату SeraphAI 🤖');
            }}
          >
            <div className="text-sm uppercase tracking-wide text-violet-200 mb-1">Основне</div>
            <div className="text-lg font-semibold mb-1">Чат з SeraphAI</div>
            <div className="text-xs text-white/70">
              Постав питання, попроси текст, ідеї, поради або код.
            </div>
          </button>

          {/* Картка генерації зображень */}
          <button
            className="rounded-2xl bg-white/10 opacity-80 hover:opacity-100 transition p-4 text-left"
            onClick={() => {
              alert('Тут зʼявиться RealForge: генерація зображень & відео 🎨');
            }}
          >
            <div className="text-sm uppercase tracking-wide text-violet-200 mb-1">Скоро</div>
            <div className="text-lg font-semibold mb-1">Генерація зображень / відео</div>
            <div className="text-xs text-white/70">
              По промпту створюємо пресети, превʼю та короткі відео.
            </div>
          </button>

          {/* Картка документів */}
          <button
            className="rounded-2xl bg-white/10 opacity-80 hover:opacity-100 transition p-4 text-left"
            onClick={() => {
              alert('Пізніше тут будуть інструменти для документів 📚');
            }}
          >
            <div className="text-sm uppercase tracking-wide text-violet-200 mb-1">Docs</div>
            <div className="text-lg font-semibold mb-1">Файли та документи</div>
            <div className="text-xs text-white/70">
              Аналіз PDF, конспекти, реферати, вирізки з тексту і т.д.
            </div>
          </button>
        </section>

        {/* Невеличкий блок про токен */}
        <section className="rounded-2xl bg-black/30 border border-white/10 p-3 text-[11px] text-white/70 mt-2">
          <div className="font-semibold mb-1">Сесія SeraphAI</div>
          <div className="break-all">
            Ми зберігаємо JWT лише в <b>sessionStorage</b> в межах Telegram WebApp.
            <br />
            Далі усі запити до API будемо робити з заголовком{' '}
            <code className="bg-white/10 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>.
          </div>
        </section>
      </div>
    </main>
  );
}
