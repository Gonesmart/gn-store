"use client";

import { useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2 } from "lucide-react";

const inputBase =
  "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none dark:bg-[#111] dark:text-white dark:placeholder:text-[#3A3A3A] dark:focus:bg-[#0D0D0D]";
const inputNormal = "border-gray-200 focus:border-[#5DC600] dark:border-[#2A2A2A]";
const inputError = "border-red-400 focus:border-red-400 dark:border-red-600";

function SuccessNote({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#5DC600]/10 px-4 py-3 text-sm font-medium text-[#5DC600]">
      <CheckCircle2 size={15} />
      {message}
    </div>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
      {message}
    </p>
  );
}

export default function ProfilePage() {
  const { data: session, refetch } = useSession();

  // Name form
  const [name, setName] = useState(session?.user.name ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    setNameSaving(true);
    setNameSuccess("");
    setNameError("");
    const res = await authClient.updateUser({ name: name.trim() });
    setNameSaving(false);
    if (res.error) {
      setNameError(res.error.message ?? "Failed to update name.");
    } else {
      setNameSuccess("Name updated.");
      refetch?.();
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwSaving(true);
    setPwSuccess("");
    setPwError("");
    const res = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });
    setPwSaving(false);
    if (res.error) {
      setPwError(res.error.message ?? "Failed to change password.");
    } else {
      setPwSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Profile</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">
          Update your name and password.
        </p>
      </div>

      {/* Name */}
      <form onSubmit={handleNameSave} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
        <h2 className="mb-5 font-bold text-gray-900 dark:text-white">Personal details</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); setNameSuccess(""); }}
              placeholder="Your full name"
              className={`${inputBase} ${nameError ? inputError : inputNormal}`}
            />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
              Email address
            </label>
            <input
              value={session?.user.email ?? ""}
              disabled
              className={`${inputBase} ${inputNormal} cursor-not-allowed opacity-50`}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-[#555]">
              Email cannot be changed.
            </p>
          </div>
          {nameSuccess && <SuccessNote message={nameSuccess} />}
          <button
            type="submit"
            disabled={nameSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5DC600] py-3 font-bold text-black transition-colors hover:bg-[#4DAF00] disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {nameSaving ? <><Loader2 size={15} className="animate-spin" />Saving...</> : "Save changes"}
          </button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordChange} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
        <h2 className="mb-5 font-bold text-gray-900 dark:text-white">Change password</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setPwError(""); }}
              placeholder="Your current password"
              autoComplete="current-password"
              className={`${inputBase} ${pwError ? inputError : inputNormal}`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPwError(""); }}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className={`${inputBase} ${pwError ? inputError : inputNormal}`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-[#A3A3A3]">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }}
              placeholder="Repeat new password"
              autoComplete="new-password"
              className={`${inputBase} ${pwError ? inputError : inputNormal}`}
            />
          </div>
          {pwError && <ErrorNote message={pwError} />}
          {pwSuccess && <SuccessNote message={pwSuccess} />}
          <button
            type="submit"
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5DC600] py-3 font-bold text-black transition-colors hover:bg-[#4DAF00] disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pwSaving ? <><Loader2 size={15} className="animate-spin" />Changing...</> : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}
