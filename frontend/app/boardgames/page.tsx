"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { BoardGame } from "@/lib/boardgames";

export default function BoardGamesPage() {
  const [boardGames, setBoardGames] = useState<BoardGame[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBoardGames() {
      try {
        const data = await apiRequest<BoardGame[]>("/boardgame", {
          cache: "no-store",
        });
        setBoardGames(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "보드게임 리스트를 불러오지 못했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBoardGames();
  }, []);

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
          <Link
            href="/boardgames/new"
            className="flex h-11 items-center justify-center rounded-md bg-neutral-950 px-5 font-medium text-white hover:bg-neutral-800"
          >
            보드게임 추가
          </Link>
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
                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
              >
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
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">등록된 보드게임이 없습니다.</h2>
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

