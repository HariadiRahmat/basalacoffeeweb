"use client";

import { FormEvent, useEffect, useState } from "react";
import { PageSection } from "@/components/dashboard-layout";
import {
  deleteBranchRecord,
  deleteStaffMember,
  fetchBranchesAll,
  fetchStaffMembersAdminOnly,
  setStaffActive,
  updateStaffMember,
  upsertBranchRecord,
} from "@/lib/firestore-data";
import { Branch, StaffMember } from "@/lib/types";

export function AdminsDashboard() {
  const [tab, setTab] = useState<"admin" | "branch">("admin");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    const [s, b] = await Promise.all([fetchStaffMembersAdminOnly(), fetchBranchesAll()]);
    setStaff(s);
    setBranches(b);
    setLoading(false);
  };

  useEffect(() => {
    reload().catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="flex gap-2">
        <button
          type="button"
          className={tab === "admin" ? "btn-primary" : "btn-outline"}
          onClick={() => setTab("admin")}
        >
          Admin
        </button>
        <button
          type="button"
          className={tab === "branch" ? "btn-primary" : "btn-outline"}
          onClick={() => setTab("branch")}
        >
          Toko
        </button>
      </div>

      {tab === "admin" ? (
        <PageSection title="Admin POS" subtitle={`${staff.length} admin`}>
          <div className="space-y-3">
            {staff.map((member) => (
              <AdminCard
                key={member.id}
                member={member}
                branches={branches}
                onSave={async (m) => {
                  await updateStaffMember(m);
                  await reload();
                }}
                onToggle={async (id, active) => {
                  await setStaffActive(id, active);
                  await reload();
                }}
                onDelete={async (id) => {
                  if (!confirm("Nonaktifkan admin ini? Akun Firebase Auth tetap ada.")) return;
                  await deleteStaffMember(id);
                  await reload();
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--caption)]">
            Tambah admin baru saat ini melalui aplikasi mobile owner.
          </p>
        </PageSection>
      ) : (
        <PageSection title="Toko / Cabang" subtitle={`${branches.length} cabang`}>
          <BranchForm onSaved={reload} />
          <div className="mt-4 space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{branch.name}</p>
                    <p className="text-sm text-[var(--caption)]">{branch.address}</p>
                    <p className="text-xs text-[var(--caption)]">
                      {branch.openTime} – {branch.closeTime} ·{" "}
                      {branch.isActive ? "Aktif" : "Nonaktif"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-outline !px-3 !py-1.5 text-xs"
                    onClick={async () => {
                      const admins = staff.filter((s) => s.branchId === branch.id).length;
                      if (admins > 0) {
                        alert("Cabang masih memiliki admin. Pindahkan admin terlebih dahulu.");
                        return;
                      }
                      if (!confirm(`Hapus cabang ${branch.name}?`)) return;
                      await deleteBranchRecord(branch.id);
                      await reload();
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}

function AdminCard({
  member,
  branches,
  onSave,
  onToggle,
  onDelete,
}: {
  member: StaffMember;
  branches: Branch[];
  onSave: (m: StaffMember) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(member);
  const branchName = branches.find((b) => b.id === draft.branchId)?.name ?? draft.branchId ?? "—";

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">{member.fullName}</p>
          <p className="text-sm text-[var(--caption)]">{member.email}</p>
          <p className="text-xs text-[var(--caption)]">
            {branchName} · {member.isActive ? "Aktif" : "Nonaktif"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-outline !px-3 !py-1.5 text-xs"
            onClick={() => onToggle(member.id, !member.isActive)}
          >
            {member.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button
            type="button"
            className="btn-outline !px-3 !py-1.5 text-xs !text-[var(--red)]"
            onClick={() => onDelete(member.id)}
          >
            Hapus
          </button>
        </div>
      </div>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave(draft);
        }}
      >
        <input
          className="input"
          value={draft.fullName}
          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
          placeholder="Nama"
        />
        <input
          className="input"
          value={draft.phone ?? ""}
          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
          placeholder="Telepon"
        />
        <select
          className="input sm:col-span-2"
          value={draft.branchId ?? ""}
          onChange={(e) => setDraft({ ...draft, branchId: e.target.value || undefined })}
        >
          <option value="">Pilih toko</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary sm:col-span-2">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}

function BranchForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const id = `branch-${Date.now()}`;
    await upsertBranchRecord({
      id,
      name: name.trim(),
      address: address.trim(),
      isActive: true,
      openTime: "08:00",
      closeTime: "22:00",
    });
    setName("");
    setAddress("");
    await onSaved();
  };

  return (
    <form onSubmit={onSubmit} className="card grid gap-3 p-4 sm:grid-cols-2">
      <input className="input" placeholder="Nama toko" value={name} onChange={(e) => setName(e.target.value)} required />
      <input
        className="input sm:col-span-2"
        placeholder="Alamat"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <button type="submit" className="btn-primary sm:col-span-2">
        + Tambah Cabang
      </button>
      <p className="sm:col-span-2 text-xs text-[var(--caption)]">
        Edit jam operasional cabang melalui aplikasi mobile.
      </p>
    </form>
  );
}
