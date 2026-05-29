'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { apiRequest, uploadFile, type UploadResponse } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { BoardGame, BoardGamePayload } from '@/lib/boardgames';

export default function EditBoardGamePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState({
    name: '',
    description: '',
    difficulty: '1',
    minPlayer: '1',
    maxPlayer: '4',
    genres: '',
  });
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [boardGameImage, setBoardGameImage] = useState<UploadResponse | null>(
    null,
  );
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadBoardGame() {
      try {
        const boardGame = await apiRequest<BoardGame>(
          `/boardgames/${params.id}`,
          {
            cache: 'no-store',
          },
        );

        setForm({
          name: boardGame.name,
          description: boardGame.description,
          difficulty: String(boardGame.difficulty),
          minPlayer: String(boardGame.minPlayer),
          maxPlayer: String(boardGame.maxPlayer),
          genres: boardGame.genres.join(', '),
        });
        setCurrentImageUrl(boardGame.imageUrl ?? '');
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : '보드게임 정보를 불러오지 못했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadBoardGame();
  }, [params.id]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleUploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setMessage('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('5MB 이하 파일만 업로드 가능합니다.');
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setMessage('로그인 후 이용할 수 있습니다.');
      return;
    }

    setMessage('');
    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadFile(
        '/s3/boardgames/image',
        file,
        token,
      );

      setBoardGameImage(uploadedImage);
      setMessage('보드게임 이미지가 업로드되었습니다.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '보드게임 이미지 업로드에 실패했습니다.',
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleBoardGameImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      handleUploadFile(file);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const token = getAccessToken();

    if (!token) {
      setMessage('로그인 후 이용할 수 있습니다.');
      return;
    }

    const payload: BoardGamePayload = {
      name: form.name,
      description: form.description,
      difficulty: Number(form.difficulty),
      minPlayer: Number(form.minPlayer),
      maxPlayer: Number(form.maxPlayer),
      genres: form.genres
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean),
      ...(boardGameImage
        ? { imageKey: boardGameImage.key, imageUrl: boardGameImage.url }
        : {}),
    };

    if (payload.minPlayer > payload.maxPlayer) {
      setMessage('최소 인원은 최대 인원보다 클 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest<BoardGame>(`/boardgames/${params.id}`, {
        method: 'PATCH',
        token,
        body: payload,
      });
      router.push('/boardgames');
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '보드게임 수정에 실패했습니다.',
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
          <h1 className="mt-3 text-3xl font-semibold">보드게임 수정</h1>
        </header>

        {isLoading ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-10 text-center text-neutral-600">
            불러오는 중
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <label className="block">
              <span className="text-sm font-medium">이름</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
                required
              />
            </label>

            <div>
              <span className="text-sm font-medium">보드게임 이미지</span>
              <div className="mt-2 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                <div className="flex aspect-[16/9] items-center justify-center bg-white">
                  {boardGameImage?.url || currentImageUrl ? (
                    <img
                      src={boardGameImage?.url ?? currentImageUrl}
                      alt="보드게임 이미지"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-neutral-500">
                      이미지 없음
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBoardGameImageChange}
                    disabled={isUploadingImage}
                    className="block w-full text-sm text-neutral-700 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-neutral-950 file:px-4 file:font-medium file:text-white hover:file:bg-neutral-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium">설명</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
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
                    updateField('difficulty', event.target.value)
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
                    updateField('minPlayer', event.target.value)
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
                    updateField('maxPlayer', event.target.value)
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
                onChange={(event) => updateField('genres', event.target.value)}
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
                disabled={isSubmitting || isUploadingImage}
                className="h-11 rounded-md bg-neutral-950 px-5 font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {isSubmitting ? '저장 중' : '저장'}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
