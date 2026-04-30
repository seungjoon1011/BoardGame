"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { BoardGame, BoardGamePayload } from "@/lib/boardgames";

export default function NewBoardGamePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: "1",
    minPlayer: "1",
    maxPlayer: "4",
    genres: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload: BoardGamePayload = {
      name: form.name,
      description: form.description,
      difficulty: Number(form.difficulty),
      minPlayer: Number(form.minPlayer),
      maxPlayer: Number(form.maxPlayer),
      genres: form.genres
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean),
    };

    if (payload.minPlayer > payload.maxPlayer) {
      setMessage("최소 인원은 최대 인원보다 클 수 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      await apiRequest<BoardGame>("/boardgame", {
        method: "POST",
        token,
        body: payload,
      });
      router.push("/boardgames");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "보드게임 추가에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <Link
            href="/boardgames"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            보드게임 리스트
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">보드게임 추가</h1>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-medium">이름</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">설명</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="mt-2 min-h-32 w-full resize-y rounded-md border border-neutral-300 px-3 py-3 outline-none focus:border-neutral-900"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium">난이도</span>
              <input
                type="number"
                min="1"
                value={form.difficulty}
                onChange={(event) =>
                  updateField("difficulty", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">최소 인원</span>
              <input
                type="number"
                min="1"
                value={form.minPlayer}
                onChange={(event) =>
                  updateField("minPlayer", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">최대 인원</span>
              <input
                type="number"
                min="1"
                value={form.maxPlayer}
                onChange={(event) =>
                  updateField("maxPlayer", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">장르</span>
            <input
              value={form.genres}
              onChange={(event) => updateField("genres", event.target.value)}
              placeholder="전략, 파티, 협력"
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              required
            />
          </label>

          {message ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/boardgames"
              className="flex h-11 items-center justify-center rounded-md border border-neutral-300 px-5 font-medium hover:bg-neutral-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-md bg-neutral-950 px-5 font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {isSubmitting ? "저장 중" : "저장"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

