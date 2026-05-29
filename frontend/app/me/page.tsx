'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { apiRequest, uploadFile, type UploadResponse } from '@/lib/api';
import { clearAuthTokens, getAccessToken } from '@/lib/auth';
import type { BoardGame, MyBoardGames } from '@/lib/boardgames';

type UserProfile = {
  id: number;
  email: string;
  username: string;
  birth: string;
  profileImageKey?: string;
  profileImageUrl?: string;
};

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ username: '' });
  const [profileImage, setProfileImage] = useState<UploadResponse | null>(null);
  const [myBoardGames, setMyBoardGames] = useState<MyBoardGames>({
    preferred: [],
    played: [],
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadMyPage() {
      const token = getAccessToken();

      if (!token) {
        setMessage('로그인 후 이용할 수 있습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const [profileData, boardGameData] = await Promise.all([
          apiRequest<UserProfile>('/users/me', { token, cache: 'no-store' }),
          apiRequest<MyBoardGames>('/users/me/boardgames', {
            token,
            cache: 'no-store',
          }),
        ]);

        setProfile(profileData);
        setForm({ username: profileData.username });
        setMyBoardGames(boardGameData);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : '내 정보를 불러오지 못했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMyPage();
  }, []);

  async function handleProfileImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    const token = getAccessToken();

    if (!file || !token) {
      return;
    }

    setMessage('');
    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadFile(
        '/s3/users/profile-image',
        file,
        token,
      );
      setProfileImage(uploadedImage);
      setMessage('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '프로필 이미지 업로드에 실패했습니다.',
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAccessToken();

    if (!token) {
      setMessage('로그인 후 이용할 수 있습니다.');
      return;
    }

    setMessage('');
    setIsSubmitting(true);

    try {
      const updated = await apiRequest<UserProfile>('/users/me', {
        method: 'PATCH',
        token,
        body: {
          username: form.username,
          ...(profileImage
            ? {
                profileImageKey: profileImage.key,
                profileImageUrl: profileImage.url,
              }
            : {}),
        },
      });

      setProfile(updated);
      setProfileImage(null);
      setMessage('프로필이 변경되었습니다.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '프로필 변경에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/boardgames"
              className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
            >
              보드게임 리스트
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">내 페이지</h1>
          </div>
          <button
            type="button"
            onClick={clearAuthTokens}
            className="h-11 rounded-md border border-neutral-300 px-5 font-medium hover:bg-white"
          >
            로그아웃
          </button>
        </header>

        {message ? (
          <p className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {message}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-10 rounded-lg border border-neutral-200 bg-white p-10 text-center text-neutral-600">
            불러오는 중
          </div>
        ) : profile ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div>
                <span className="text-sm font-medium">프로필 이미지</span>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                    {profileImage?.url || profile.profileImageUrl ? (
                      <img
                        src={profileImage?.url ?? profile.profileImageUrl}
                        alt="프로필 이미지"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-3 text-center text-xs text-neutral-500">
                        이미지 없음
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    disabled={isUploadingImage}
                    className="block min-w-0 flex-1 text-sm text-neutral-700 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-neutral-950 file:px-4 file:font-medium file:text-white hover:file:bg-neutral-800 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium">닉네임</span>
                <input
                  value={form.username}
                  onChange={(event) =>
                    setForm({ username: event.target.value })
                  }
                  className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
                  required
                />
              </label>

              <div className="rounded-md bg-neutral-50 p-3 text-sm">
                <p className="text-neutral-500">이메일</p>
                <p className="mt-1 font-medium">{profile.email}</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="h-11 w-full rounded-md bg-neutral-950 px-4 font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {isSubmitting ? '저장 중' : '프로필 저장'}
              </button>
            </form>

            <div className="space-y-6">
              <BoardGameSection
                title="좋아요 한 보드게임"
                boardGames={myBoardGames.preferred}
              />
              <BoardGameSection
                title="플레이해봤어요"
                boardGames={myBoardGames.played}
              />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function BoardGameSection({
  title,
  boardGames,
}: {
  title: string;
  boardGames: BoardGame[];
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      {boardGames.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {boardGames.map((game) => (
            <Link
              key={game.id}
              href={`/boardgames/${game.id}/edit`}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-300"
            >
              <p className="font-semibold">{game.name}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                {game.description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500">
          아직 기록이 없습니다.
        </div>
      )}
    </section>
  );
}
