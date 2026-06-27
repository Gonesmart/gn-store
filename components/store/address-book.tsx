"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Star, X, Loader2 } from "lucide-react";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type AddressInput,
} from "@/actions/account";
import type { Address } from "@prisma/client";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const inputBase =
  "w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none dark:bg-[#111] dark:text-white dark:placeholder:text-[#3A3A3A] dark:focus:bg-[#0D0D0D]";
const inputNormal = "border-gray-200 focus:border-[#5DC600] dark:border-[#2A2A2A]";

const EMPTY: AddressInput = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", country: "Nigeria",
};

function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial: AddressInput;
  onSave: (data: AddressInput) => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
}) {
  const [form, setForm] = useState<AddressInput>(initial);
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-[#A3A3A3]">Full name *</label>
          <input required value={form.fullName} onChange={set("fullName")} placeholder="Jane Doe" className={`${inputBase} ${inputNormal}`} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-[#A3A3A3]">Phone *</label>
          <input required value={form.phone} onChange={set("phone")} type="tel" placeholder="+234 800 000 0000" className={`${inputBase} ${inputNormal}`} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-[#A3A3A3]">Street address *</label>
        <input required value={form.addressLine1} onChange={set("addressLine1")} placeholder="123 Allen Avenue" className={`${inputBase} ${inputNormal}`} />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-[#A3A3A3]">Apartment, suite, etc.</label>
        <input value={form.addressLine2 ?? ""} onChange={set("addressLine2")} placeholder="Flat 2B (optional)" className={`${inputBase} ${inputNormal}`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-[#A3A3A3]">City *</label>
          <input required value={form.city} onChange={set("city")} placeholder="Lagos" className={`${inputBase} ${inputNormal}`} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-[#A3A3A3]">State *</label>
          <select required value={form.state} onChange={set("state")} className={`${inputBase} ${inputNormal}`}>
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#5DC600] px-6 py-2.5 text-sm font-bold text-black hover:bg-[#4DAF00] disabled:opacity-60"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : "Save address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-400 dark:border-[#2A2A2A] dark:text-[#A3A3A3] dark:hover:border-[#4A4A4A]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function refresh() {
    startTransition(() => { router.refresh(); });
  }

  async function handleAdd(data: AddressInput) {
    setFormError("");
    const res = await addAddress(data);
    if (res.success) { setShowForm(false); refresh(); }
    else setFormError(res.error ?? "Failed to save.");
  }

  async function handleEdit(id: string, data: AddressInput) {
    setFormError("");
    const res = await updateAddress(id, data);
    if (res.success) { setEditId(null); refresh(); }
    else setFormError(res.error ?? "Failed to save.");
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteAddress(id);
    setDeletingId(null);
    refresh();
  }

  async function handleSetDefault(id: string) {
    await setDefaultAddress(id);
    refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Add new */}
      {!showForm && !editId && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 self-start rounded-xl border border-dashed border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-[#5DC600] hover:text-[#5DC600] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] dark:border-[#3A3A3A] dark:text-[#A3A3A3]"
        >
          <Plus size={15} />
          Add new address
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-[#5DC600]/30 bg-white dark:bg-[#1A1A1A]">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-[#2A2A2A]">
            <p className="text-sm font-bold text-gray-900 dark:text-white">New address</p>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <X size={16} />
            </button>
          </div>
          <AddressForm
            initial={EMPTY}
            onSave={handleAdd}
            onCancel={() => setShowForm(false)}
            saving={pending}
            error={formError}
          />
        </div>
      )}

      {/* Address cards */}
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-[#2A2A2A]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1A1A1A]">
            <MapPin size={20} className="text-gray-300 dark:text-[#3A3A3A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">No addresses saved</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-[#A3A3A3]">Add an address to speed up checkout.</p>
          </div>
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="rounded-2xl border border-gray-100 bg-white dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
          {editId === addr.id ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-[#2A2A2A]">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Edit address</p>
                <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <AddressForm
                initial={{
                  fullName: addr.fullName,
                  phone: addr.phone,
                  addressLine1: addr.addressLine1,
                  addressLine2: addr.addressLine2 ?? "",
                  city: addr.city,
                  state: addr.state,
                  country: addr.country,
                }}
                onSave={(data) => handleEdit(addr.id, data)}
                onCancel={() => setEditId(null)}
                saving={pending}
                error={formError}
              />
            </>
          ) : (
            <div className="flex items-start justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5DC600]/10">
                  <MapPin size={15} className="text-[#5DC600]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{addr.fullName}</p>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-[#5DC600]/10 px-2 py-0.5 text-xs font-semibold text-[#5DC600]">
                        <Star size={10} fill="currentColor" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-[#A3A3A3]">
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                    {addr.city}, {addr.state}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-[#555]">{addr.phone}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    title="Set as default"
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#5DC600] dark:hover:bg-[#2A2A2A]"
                  >
                    <Star size={15} />
                  </button>
                )}
                <button
                  onClick={() => { setEditId(addr.id); setFormError(""); }}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#2A2A2A] dark:hover:text-white"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 disabled:opacity-40"
                >
                  {deletingId === addr.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
