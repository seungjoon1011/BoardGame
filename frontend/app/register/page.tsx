"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { apiRequest, uploadFile, type UploadResponse } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [birth, setBirth] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState<UploadResponse | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendCode() {
    setMessage("");
    setIsSendingCode(true);

    try {
      await apiRequest<null>("/email/send", {
        method: "POST",
        body: { email },
      });
      setMessage("인증 코드를 보냈습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "인증 코드 발송에 실패했습니다.",
      );
    } finally {
      setIsSendingCode(false);
    }
  }

  async function verifyCode() {
    setMessage("");
    setIsVerifyingCode(true);

    try {
      await apiRequest<{ message: string }>("/email/verify", {
        method: "POST",
        body: { email, code },
      });
      setIsEmailVerified(true);
      setMessage("이메일 인증이 완료되었습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "이메일 인증에 실패했습니다.",
      );
    } finally {
      setIsVerifyingCode(false);
    }
  }

  async function handleProfileImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadFile("/s3/users/profile-image", file);
      setProfileImage(uploadedImage);
      setMessage("프로필 이미지가 업로드되었습니다.");
    } catch (error) {
      setProfileImage(null);
      setMessage(
        error instanceof Error
          ? error.message
          : "프로필 이미지 업로드에 실패했습니다.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: {
          username,
          email,
          password,
          birth,
          ...(profileImage
            ? {
                profileImageKey: profileImage.key,
                profileImageUrl: profileImage.url,
              }
            : {}),
        },
      });
      router.push("/login");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "회원가입에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-12 text-neutral-950">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-lg flex-col justify-center">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            BoardGame
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">회원가입</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-medium">이메일</span>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setIsEmailVerified(false);
                }}
                className="h-11 min-w-0 flex-1 rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
                required
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={!email || isSendingCode}
                className="h-11 shrink-0 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
              >
                {isSendingCode ? "발송 중" : "인증"}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium">인증 코드</span>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={verifyCode}
                disabled={!email || !code || isVerifyingCode || isEmailVerified}
                className="h-11 shrink-0 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
              >
                {isEmailVerified
                  ? "완료"
                  : isVerifyingCode
                    ? "확인 중"
                    : "확인"}
              </button>
            </div>
          </label>

          <div>
            <span className="text-sm font-medium">프로필 이미지</span>
            <div className="mt-2 flex flex-col gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white">
                {profileImage ? (
                  <img
                    src={profileImage.url}
                    alt="업로드된 프로필 이미지"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-3 text-center text-xs text-neutral-500">
                    이미지 없음
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  disabled={isUploadingImage}
                  className="block w-full text-sm text-neutral-700 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-neutral-950 file:px-4 file:font-medium file:text-white hover:file:bg-neutral-800 disabled:cursor-not-allowed"
                />
                <p className="mt-2 text-sm text-neutral-500">
                  {isUploadingImage
                    ? "업로드 중"
                    : profileImage
                      ? profileImage.key
                      : "5MB 이하 이미지 파일을 선택하세요."}
                </p>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium">닉네임</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">생년월일</span>
            <input
              type="date"
              value={birth}
              onChange={(event) => setBirth(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              minLength={6}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">비밀번호 확인</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 px-3 outline-none focus:border-neutral-900"
              minLength={6}
              required
            />
          </label>

          {message ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="h-11 w-full rounded-md bg-neutral-950 px-4 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            {isSubmitting ? "가입 중" : "회원가입"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-neutral-600">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-medium text-neutral-950">
            로그인
          </Link>
        </p>
      </section>
    </main>
  );
}
