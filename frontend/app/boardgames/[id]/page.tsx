'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import type { BoardGame, MyBoardGames } from '@/lib/boardgames';

type UserProfile = {
  id: number;
  email: string;
  username: string;
  profileImageUrl?: string;
};

type Review = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    profileImageUrl?: string;
  };
};

export default function BoardGameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = Number(params.id);

  const [game, setGame] = useState<BoardGame | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // 상태 관리
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 리뷰 등록 폼 상태
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 리뷰 수정 상태
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      const token = getAccessToken();
      setIsLoggedIn(Boolean(token));

      // 1. 보드게임 상세 및 선호/플레이 정보 로드
      try {
        const [gameData, myBoardGames] = await Promise.all([
          apiRequest<BoardGame>(`/boardgames/${gameId}`, { cache: 'no-store' }),
          token
            ? apiRequest<MyBoardGames>('/users/me/boardgames', {
                token,
                cache: 'no-store',
              }).catch(() => null)
            : Promise.resolve(null),
        ]);

        const preferred = myBoardGames?.preferred.some((g) => g.id === gameId) ?? false;
        const played = myBoardGames?.played.some((g) => g.id === gameId) ?? false;

        setGame({
          ...gameData,
          preferred,
          played,
        });
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : '보드게임 정보를 불러오지 못했습니다.'
        );
      } finally {
        setIsGameLoading(false);
      }

      // 2. 현재 로그인한 사용자 프로필 로드 (본인 리뷰 구별용)
      if (token) {
        try {
          const profileData = await apiRequest<UserProfile>('/users/me', {
            token,
            cache: 'no-store',
          });
          setProfile(profileData);
        } catch {
          // 프로필 가져오기 실패는 비치명적 에러로 취급
        }
      }

      // 3. 리뷰/댓글 목록 로드
      try {
        const reviewsData = await apiRequest<Review[]>(`/boardgames/${gameId}/reviews`, {
          cache: 'no-store',
        });
        setReviews(reviewsData);
      } catch (error) {
        console.error('리뷰 목록 로드 실패:', error);
      } finally {
        setIsReviewsLoading(false);
      }
    }

    if (gameId) {
      loadData();
    }
  }, [gameId]);

  // 좋아요 / 플레이 상태 토글
  async function toggleState(type: 'preferred' | 'played') {
    const token = getAccessToken();
    if (!token) {
      alert('로그인 후 이용할 수 있습니다.');
      return;
    }

    try {
      const path =
        type === 'preferred'
          ? `/boardgames/${gameId}/preferred`
          : `/boardgames/${gameId}/played`;
      const data = await apiRequest<{ preferred?: boolean; played?: boolean }>(path, {
        method: 'POST',
        token,
      });

      setGame((current) =>
        current
          ? {
              ...current,
              [type]:
                type === 'preferred'
                  ? Boolean(data.preferred)
                  : Boolean(data.played),
            }
          : null
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : '상태 변경에 실패했습니다.');
    }
  }

  // 댓글 등록
  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = getAccessToken();
    if (!token) {
      alert('로그인 후 댓글 작성이 가능합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdReview = await apiRequest<Review>(`/boardgames/${gameId}/reviews`, {
        method: 'POST',
        token,
        body: { content: newComment },
      });

      setReviews((current) => [createdReview, ...current]);
      setNewComment('');
    } catch (error) {
      alert(error instanceof Error ? error.message : '댓글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // 댓글 수정 모드 진입
  function startEditing(review: Review) {
    setEditingReviewId(review.id);
    setEditingContent(review.content);
  }

  // 댓글 수정 취소
  function cancelEditing() {
    setEditingReviewId(null);
    setEditingContent('');
  }

  // 댓글 수정 저장
  async function handleCommentUpdate(reviewId: number) {
    if (!editingContent.trim()) return;

    const token = getAccessToken();
    if (!token) return;

    setIsSavingEdit(true);
    try {
      const updatedReview = await apiRequest<Review>(`/reviews/${reviewId}`, {
        method: 'PATCH',
        token,
        body: { content: editingContent },
      });

      setReviews((current) =>
        current.map((r) => (r.id === reviewId ? { ...r, content: updatedReview.content, updatedAt: updatedReview.updatedAt } : r))
      );
      setEditingReviewId(null);
      setEditingContent('');
    } catch (error) {
      alert(error instanceof Error ? error.message : '댓글 수정에 실패했습니다.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  // 댓글 삭제
  async function handleCommentDelete(reviewId: number) {
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    const token = getAccessToken();
    if (!token) return;

    try {
      await apiRequest<void>(`/reviews/${reviewId}`, {
        method: 'DELETE',
        token,
      });

      setReviews((current) => current.filter((r) => r.id !== reviewId));
    } catch (error) {
      alert(error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.');
    }
  }

  // 날짜 형식 포맷팅
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  if (isGameLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 px-5 py-10 flex items-center justify-center">
        <div className="text-neutral-600 text-lg">보드게임 상세 정보를 불러오는 중...</div>
      </main>
    );
  }

  if (message || !game) {
    return (
      <main className="min-h-screen bg-neutral-50 px-5 py-10 flex flex-col items-center justify-center gap-4">
        <div className="text-red-600 font-medium text-lg">{message || '보드게임을 찾을 수 없습니다.'}</div>
        <Link href="/boardgames" className="rounded-md bg-neutral-950 px-5 py-2.5 font-medium text-white hover:bg-neutral-800">
          목록으로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-950">
      <section className="mx-auto w-full max-w-4xl">
        {/* 상단 네비게이션 */}
        <nav className="mb-6">
          <Link href="/boardgames" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            보드게임 리스트로 돌아가기
          </Link>
        </nav>

        {/* 보드게임 카드 */}
        <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
          {game.imageUrl && (
            <div className="aspect-[21/9] w-full bg-neutral-100 border-b border-neutral-200">
              <img src={game.imageUrl} alt={`${game.name} 이미지`} className="h-full w-full object-cover" />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{game.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span key={genre} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <span className="self-start shrink-0 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800 border border-emerald-100">
                난이도 {game.difficulty}
              </span>
            </div>

            <div className="mt-8 border-t border-neutral-100 pt-6">
              <h2 className="text-lg font-bold text-neutral-900">게임 소개</h2>
              <p className="mt-3 text-neutral-600 leading-relaxed whitespace-pre-wrap">{game.description}</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-6">
              <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100/50">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">최소 인원</span>
                <p className="mt-1 text-2xl font-bold text-neutral-900">{game.minPlayer}명</p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100/50">
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">최대 인원</span>
                <p className="mt-1 text-2xl font-bold text-neutral-900">{game.maxPlayer}명</p>
              </div>
            </div>

            {/* 유저 반응 및 관리 섹션 */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between border-t border-neutral-100 pt-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleState('preferred')}
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-bold transition-all duration-200 ${
                    game.preferred
                      ? 'border-rose-200 bg-rose-50/70 text-rose-700 shadow-sm shadow-rose-100'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={game.preferred ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  좋아요
                </button>
                <button
                  type="button"
                  onClick={() => toggleState('played')}
                  className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-bold transition-all duration-200 ${
                    game.played
                      ? 'border-sky-200 bg-sky-50/70 text-sky-700 shadow-sm shadow-sky-100'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={game.played ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  플레이해봄
                </button>
              </div>
              
              <Link
                href={`/boardgames/${game.id}/edit`}
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-200"
              >
                상세 정보 수정
              </Link>
            </div>
          </div>
        </article>

        {/* 리뷰 / 댓글 섹션 */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2 mb-6">
            <span>리뷰 및 댓글</span>
            <span className="text-base font-semibold bg-neutral-200 text-neutral-700 px-2.5 py-0.5 rounded-full">
              {reviews.length}
            </span>
          </h2>

          {/* 댓글 작성 폼 */}
          {isLoggedIn ? (
            <form onSubmit={handleCommentSubmit} className="mb-8 p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <label htmlFor="comment" className="block text-sm font-bold text-neutral-800">
                의견을 남겨주세요
              </label>
              <div className="mt-3">
                <textarea
                  id="comment"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="보드게임에 대한 소중한 리뷰를 남겨주세요. 찰진 부장님의 피드백을 기다립니다! 🐟"
                  className="w-full rounded-xl border border-neutral-200 p-4 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none"
                  required
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="h-11 rounded-xl bg-neutral-950 px-6 font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 transition-all"
                >
                  {isSubmitting ? '등록 중...' : '리뷰 등록'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center">
              <p className="text-neutral-500 font-medium">리뷰를 등록하려면 로그인이 필요합니다.</p>
              <Link
                href="/login"
                className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-6 font-bold text-white hover:bg-neutral-800 transition-all text-sm"
              >
                로그인 하러가기
              </Link>
            </div>
          )}

          {/* 댓글 목록 */}
          {isReviewsLoading ? (
            <div className="p-8 text-center text-neutral-500">리뷰를 불러오는 중입니다...</div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isAuthor = profile && profile.id === review.user.id;
                const isEditing = editingReviewId === review.id;
                const hasBeenUpdated = new Date(review.updatedAt).getTime() > new Date(review.createdAt).getTime();

                return (
                  <article key={review.id} className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:border-neutral-300">
                    <header className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* 프로필 이미지 또는 기본 아바타 */}
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-neutral-100 bg-neutral-100">
                          {review.user.profileImageUrl ? (
                            <img src={review.user.profileImageUrl} alt={`${review.user.username} 프로필`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm font-bold text-neutral-500">
                              {review.user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-neutral-800">{review.user.username}</span>
                          <span className="block text-xs text-neutral-400 mt-0.5">
                            {formatDate(review.createdAt)}
                            {hasBeenUpdated && <span className="text-neutral-400/80 ml-1.5">(수정됨)</span>}
                          </span>
                        </div>
                      </div>

                      {/* 수정/삭제 액션 버튼 */}
                      {isAuthor && !isEditing && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(review)}
                            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-50 transition-all"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCommentDelete(review.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-all"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </header>

                    {/* 댓글 내용 영역 */}
                    <div className="mt-4">
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            rows={3}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 p-4 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none"
                            required
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="h-9 rounded-lg border border-neutral-300 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommentUpdate(review.id)}
                              disabled={isSavingEdit || !editingContent.trim()}
                              className="h-9 rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white hover:bg-neutral-800 disabled:bg-neutral-200 transition-all"
                            >
                              {isSavingEdit ? '저장 중...' : '수정 완료'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl border border-dashed border-neutral-200 bg-white text-neutral-500">
              아직 등록된 리뷰가 없습니다. 첫 소중한 피드백을 남겨주세요! 🐟
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
