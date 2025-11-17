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
      router.replace('/tg');
      return;
    }

    setToken(stored);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 text-white">
        <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/70 backdrop-blur">
          Перевірка сесії…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 text-white p-4">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 border border-white/15 shadow-md">
            <span className="text-sm font-semibold">SAI</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">SeraphAI</h1>
            <p className="text-[11px] text-white/60">Твій AI-помічник всередині Telegram</p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-black/30 border border-emerald-400/30 text-[10px] text-emerald-100/90 backdrop-blur">
          ● Сесія активна
        </div>
      </header>

      {/* Основний контент */}
      <div className="grid gap-4">
        {/* Hero / summary */}
        <section className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold mb-1">Що вміє SeraphAI</h2>
              <p className="text-xs text-white/70 mb-3">
                Один інтерфейс — кілька модулів: чат, генерація контенту, документи та інкогніто.
              </p>
            </div>
            <span className="text-lg">✨</span>
          </div>

          <ul className="text-[13px] text-white/80 space-y-1.5">
            <li>• GPT-стиль діалогів, персональний асистент</li>
            <li>• Генерація зображень та медіа (скоро)</li>
            <li>• Робота з документами та файлами (аналітика, конспекти)</li>
            <li>• Інкогніто-режим без збереження історії (пізніше)</li>
          </ul>
        </section>

        {/* Карточки модулів */}
        <section className="grid grid-cols-1 gap-3">
          {/* Чат */}
          <button
            className="group rounded-3xl bg-white/8 hover:bg-white/12 active:bg-white/15 transition-colors p-4 text-left border border-white/10 backdrop-blur-md shadow-md"
            onClick={() => {
              alert('Далі тут буде окремий екран чату SeraphAI 🤖');
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-violet-200 mb-1">
                  Основне
                </div>
                <div className="text-lg font-semibold mb-1">Чат з SeraphAI</div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-sm group-active:scale-95 transition">
                💬
              </div>
            </div>
            <div className="text-xs text-white/75 mt-1">
              Постав питання, попроси текст, ідеї, поради чи код. Відповіді оптимізовані під
              мобільне читання.
            </div>
          </button>

          {/* Генерація медіа */}
          <button
            className="group rounded-3xl bg-white/5 opacity-80 hover:opacity-100 transition p-4 text-left border border-white/10 backdrop-blur-md"
            onClick={() => {
              alert('Тут зʼявиться RealForge: генерація зображень і відео 🎨');
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-violet-200 mb-1">
                  Скоро
                </div>
                <div className="text-lg font-semibold mb-1">Генерація зображень / відео</div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-fuchsia-500/20 text-sm group-active:scale-95 transition">
                🎨
              </div>
            </div>
            <div className="text-xs text-white/70 mt-1">
              За промптом створюємо стилізовані зображення, превʼю для контенту та короткі ролики.
            </div>
          </button>

          {/* Документи */}
          <button
            className="group rounded-3xl bg-white/5 opacity-80 hover:opacity-100 transition p-4 text-left border border-white/10 backdrop-blur-md"
            onClick={() => {
              alert('Пізніше тут будуть інструменти для документів 📚');
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-violet-200 mb-1">Docs</div>
                <div className="text-lg font-semibold mb-1">Файли та документи</div>
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sm group-active:scale-95 transition">
                📚
              </div>
            </div>
            <div className="text-xs text-white/70 mt-1">
              Аналіз PDF, конспекти, реферати, витяг ключових тез та автоматичні зведення.
            </div>
          </button>
        </section>

        {/* Блок про токен / безпеку */}
        <section className="rounded-3xl bg-black/35 border border-white/10 p-3 text-[11px] text-white/75 mt-1 backdrop-blur">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-xs">🔐</div>
            <div>
              <div className="font-semibold mb-1">Сесія SeraphAI</div>
              <p className="leading-relaxed">
                JWT зберігається тільки в <b>sessionStorage</b> всередині Telegram WebApp. Далі всі
                запити до API робитимемо з заголовком{' '}
                <code className="bg-white/10 px-1 rounded">
                  Authorization: Bearer &lt;token&gt;
                </code>
                .
              </p>
              {token && (
                <p className="mt-1 text-[10px] text-white/50 break-all">
                  <span className="opacity-70">Поточний токен (обрізаний): </span>
                  {token.slice(0, 24)}…
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
