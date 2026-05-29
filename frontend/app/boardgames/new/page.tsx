'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { apiRequest, uploadFile, type UploadResponse } from '@/lib/api';
import type { BoardGame, BoardGamePayload } from '@/lib/boardgames';

export default function NewBoardGamePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    difficulty: '1',
    minPlayer: '1',
    maxPlayer: '4',
    genres: '',
  });
  const [message, setMessage] = useState('');
  const [boardGameImage, setBoardGameImage] = useState<UploadResponse | null>(
    null,
  );
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) handleUploadFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleUploadFile(file: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('5MB 이하 파일만 업로드 가능합니다.');
      return;
    }

    setMessage('');
    setIsUploadingImage(true);

    try {
      const token = localStorage.getItem('accessToken');
      const uploadedImage = await uploadFile(
        '/s3/boardgames/image',
        file,
        token,
      );

      setBoardGameImage(uploadedImage);
      setMessage('보드게임 이미지가 업로드되었습니다.');
    } catch (error) {
      setBoardGameImage(null);
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
    if (file) handleUploadFile(file);
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnter = () => setIsDragging(true);
  const handleDragLeave = () => setIsDragging(false);

  // async function handleBoardGameImageChange(
  //   event: ChangeEvent<HTMLInputElement>,
  // ) {
  //   const file = event.target.files?.[0];

  //   if (!file) {
  //     return;
  //   }
  //   if(file.size > 5 * 1024 * 1024){
  //     setMessage("5MB 이하 파일만 업로드 가능합니다.");
  //     return;
  //   }

  //   setMessage('');
  //   setIsUploadingImage(true);

  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     const uploadedImage = await uploadFile(
  //       '/s3/boardgames/image',
  //       file,
  //       token,
  //     );
  //     setBoardGameImage(uploadedImage);
  //     setMessage('보드게임 이미지가 업로드되었습니다.');
  //   } catch (error) {
  //     setBoardGameImage(null);
  //     setMessage(
  //       error instanceof Error
  //         ? error.message
  //         : '보드게임 이미지 업로드에 실패했습니다.',
  //     );
  //   } finally {
  //     setIsUploadingImage(false);
  //   }
  // }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

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
      const token = localStorage.getItem('accessToken');
      await apiRequest<BoardGame>('/boardgames', {
        method: 'POST',
        token,
        body: payload,
      });
      router.push('/boardgames');
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '보드게임 추가에 실패했습니다.',
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
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              required
            />
          </label>

          <div>
            <span className="text-sm font-medium">보드게임 이미지</span>
            <div className="mt-2 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
              <div
                className={
                  'flex aspect-[16/9] items-center justify-center bg-white'
                }
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              >
                {boardGameImage ? (
                  <img
                    src={boardGameImage.url}
                    alt="업로드된 보드게임 이미지"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-neutral-500">
                    드래그 or 붙여넣기
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
                <p className="mt-2 text-sm text-neutral-500">
                  {isUploadingImage
                    ? '업로드 중'
                    : boardGameImage
                      ? boardGameImage.key
                      : '5MB 이하 이미지 파일을 선택하세요.'}
                </p>
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
      </section>
    </main>
  );
}
