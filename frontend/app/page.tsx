'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearAuthTokens, isLoggedIn } from '@/lib/auth';

export default function Home() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    function syncSession() {
      setHasSession(isLoggedIn());
    }

    syncSession();
    window.addEventListener('auth:changed', syncSession);
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener('auth:changed', syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            BoardGame
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            함께 즐길 보드게임을 기록하고 찾아보세요.
          </h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">
            계정을 만들고 보드게임 목록을 확인하거나 새로운 게임 정보를 추가할
            수 있습니다.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/boardgames"
            className="flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-white hover:bg-neutral-800"
          >
            보드게임 보기
          </Link>
          {hasSession ? (
            <>
              <Link
                href="/me"
                className="flex h-12 items-center justify-center rounded-md border border-neutral-300 px-6 font-medium hover:bg-white"
              >
                내 페이지
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearAuthTokens();
                  setHasSession(false);
                }}
                className="flex h-12 items-center justify-center rounded-md border border-neutral-300 px-6 font-medium hover:bg-white"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-md border border-neutral-300 px-6 font-medium hover:bg-white"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="flex h-12 items-center justify-center rounded-md border border-neutral-300 px-6 font-medium hover:bg-white"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
