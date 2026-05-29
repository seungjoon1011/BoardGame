'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { BoardGame, MyBoardGames } from '@/lib/boardgames';

export default function BoardGamesPage() {
  const [boardGames, setBoardGames] = useState<BoardGame[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadBoardGames() {
      try {
        const token = getAccessToken();
        setIsLoggedIn(Boolean(token));

        const [games, myBoardGames] = await Promise.all([
          apiRequest<BoardGame[]>('/boardgames', {
            cache: 'no-store',
          }),
          token
            ? apiRequest<MyBoardGames>('/users/me/boardgames', {
                token,
                cache: 'no-store',
              }).catch(() => null)
            : Promise.resolve(null),
        ]);
        const preferredIds = new Set(
          myBoardGames?.preferred.map((game) => game.id) ?? [],
        );
        const playedIds = new Set(
          myBoardGames?.played.map((game) => game.id) ?? [],
        );

        setBoardGames(
          games.map((game) => ({
            ...game,
            preferred: preferredIds.has(game.id),
            played: playedIds.has(game.id),
          })),
        );
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : '보드게임 리스트를 불러오지 못했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBoardGames();
  }, []);

  async function toggleBoardGameState(
    gameId: number,
    type: 'preferred' | 'played',
  ) {
    const token = getAccessToken();

    if (!token) {
      setMessage('로그인 후 이용할 수 있습니다.');
      return;
    }

    try {
      const path =
        type === 'preferred'
          ? `/boardgames/${gameId}/preferred`
          : `/boardgames/${gameId}/played`;
      const data = await apiRequest<{ preferred?: boolean; played?: boolean }>(
        path,
        {
          method: 'POST',
          token,
        },
      );

      setBoardGames((current) =>
        current.map((game) =>
          game.id === gameId
            ? {
                ...game,
                [type]:
                  type === 'preferred'
                    ? Boolean(data.preferred)
                    : Boolean(data.played),
              }
            : game,
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '상태 변경에 실패했습니다.',
      );
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
            >
              BoardGame
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">보드게임 리스트</h1>
            <p className="mt-2 text-neutral-600">
              등록된 보드게임 {boardGames.length}개
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {isLoggedIn ? (
              <Link
                href="/me"
                className="flex h-11 items-center justify-center rounded-md border border-neutral-300 px-5 font-medium hover:bg-white"
              >
                내 페이지
              </Link>
            ) : null}
            <Link
              href="/boardgames/new"
              className="flex h-11 items-center justify-center rounded-md bg-neutral-950 px-5 font-medium text-white hover:bg-neutral-800"
            >
              보드게임 추가
            </Link>
          </div>
        </header>

        {message ? (
          <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-10 rounded-lg border border-neutral-200 bg-white p-10 text-center text-neutral-600">
            불러오는 중
          </div>
        ) : boardGames.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {boardGames.map((game) => (
              <article
                key={game.id}
                className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
              >
                {game.imageUrl ? (
                  <div className="aspect-[16/9] bg-neutral-100">
                    <img
                      src={game.imageUrl}
                      alt={`${game.name} 이미지`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold">{game.name}</h2>
                    <span className="shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-800">
                      난이도 {game.difficulty}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                    {game.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {game.genres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-neutral-50 p-3">
                      <dt className="text-neutral-500">최소 인원</dt>
                      <dd className="mt-1 font-semibold">{game.minPlayer}명</dd>
                    </div>
                    <div className="rounded-md bg-neutral-50 p-3">
                      <dt className="text-neutral-500">최대 인원</dt>
                      <dd className="mt-1 font-semibold">{game.maxPlayer}명</dd>
                    </div>
                  </dl>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => toggleBoardGameState(game.id, 'preferred')}
                      className={`h-10 rounded-md border px-3 text-sm font-medium ${
                        game.preferred
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      좋아요
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBoardGameState(game.id, 'played')}
                      className={`h-10 rounded-md border px-3 text-sm font-medium ${
                        game.played
                          ? 'border-sky-200 bg-sky-50 text-sky-700'
                          : 'border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      플레이
                    </button>
                    <Link
                      href={`/boardgames/${game.id}/edit`}
                      className="flex h-10 items-center justify-center rounded-md border border-neutral-300 px-3 text-sm font-medium hover:bg-neutral-50"
                    >
                      수정
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              등록된 보드게임이 없습니다.
            </h2>
            <Link
              href="/boardgames/new"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-neutral-950 px-5 font-medium text-white hover:bg-neutral-800"
            >
              첫 보드게임 추가
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
