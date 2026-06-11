"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";
import { fetchLoyaltySettings, saveLoyaltySettings } from "@/lib/firestore-data";
import { LoyaltySettings } from "@/lib/types";

export function LoyaltyDashboard() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchLoyaltySettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<LoyaltySettings>) => {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      await saveLoyaltySettings(settings);
      setMessage({ type: "success", text: "Pengaturan loyalty berhasil disimpan." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan pengaturan.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="dashboard-page">
      {message && (
        <div
          className={`alert-banner ${message.type === "success" ? "alert-banner--success" : "alert-banner--error"}`}
        >
          {message.type === "success" && (
            <FeatureIcon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <LoyaltyCard
        icon="gift"
        iconTone="program"
        title="Program"
        description="Aktifkan atau nonaktifkan seluruh fitur loyalty"
      >
        <SwitchRow
          label="Aktifkan program loyalty"
          checked={settings.programEnabled}
          onChange={(v) => update({ programEnabled: v })}
        />
      </LoyaltyCard>

      <LoyaltyCard
        icon="user-plus"
        iconTone="member"
        title="Member Baru"
        description="Reward saat pelanggan pertama kali terdaftar"
      >
        <SwitchRow
          label="Bonus member baru"
          checked={settings.newMemberEnabled}
          onChange={(v) => update({ newMemberEnabled: v })}
        />
        <div className={`loyalty-fields ${!settings.newMemberEnabled ? "loyalty-fields--muted" : ""}`}>
          <Field
            label="Jenis reward"
            type="select"
            value={settings.newMemberRewardType}
            options={[
              ["discountPercent", "Diskon persen"],
              ["discountFixed", "Diskon nominal"],
              ["bonusPoints", "Bonus poin"],
            ]}
            onChange={(v) =>
              update({ newMemberRewardType: v as LoyaltySettings["newMemberRewardType"] })
            }
          />
          <div className="form-grid">
            {settings.newMemberRewardType === "discountPercent" && (
              <Field
                label="Diskon member baru"
                type="number"
                suffix="%"
                value={settings.newMemberDiscountPercent}
                onChange={(v) => update({ newMemberDiscountPercent: Number(v) })}
              />
            )}
            {settings.newMemberRewardType === "discountFixed" && (
              <Field
                label="Diskon nominal"
                type="number"
                suffix="Rp"
                value={settings.newMemberDiscountFixed}
                onChange={(v) => update({ newMemberDiscountFixed: Number(v) })}
              />
            )}
            {settings.newMemberRewardType === "bonusPoints" && (
              <Field
                label="Bonus poin"
                type="number"
                suffix="poin"
                value={settings.newMemberBonusPoints}
                onChange={(v) => update({ newMemberBonusPoints: Number(v) })}
              />
            )}
          </div>
        </div>
      </LoyaltyCard>

      <LoyaltyCard
        icon="star"
        iconTone="points"
        title="Akumulasi Poin"
        description="Pelanggan mendapat poin dari setiap transaksi"
      >
        <SwitchRow
          label="Kumpulkan poin dari pembelian"
          checked={settings.pointsEnabled}
          onChange={(v) => update({ pointsEnabled: v })}
        />
        <div className={`loyalty-fields ${!settings.pointsEnabled ? "loyalty-fields--muted" : ""}`}>
          <div className="form-grid">
            <Field
              label="Nominal belanja per 1 poin"
              type="number"
              suffix="Rp"
              value={settings.spendAmountPerPoint}
              onChange={(v) => update({ spendAmountPerPoint: Number(v) })}
            />
            <Field
              label="Poin didapat per unit nominal"
              type="number"
              suffix="poin"
              value={settings.pointsPerSpendUnit}
              onChange={(v) => update({ pointsPerSpendUnit: Number(v) })}
            />
          </div>
        </div>
      </LoyaltyCard>

      <LoyaltyCard
        icon="redeem"
        iconTone="redeem"
        title="Penukaran Poin"
        description="Tukar poin menjadi diskon di kasir"
      >
        <SwitchRow
          label="Izinkan penukaran poin jadi diskon"
          checked={settings.redeemEnabled}
          onChange={(v) => update({ redeemEnabled: v })}
        />
        <div className={`loyalty-fields ${!settings.redeemEnabled ? "loyalty-fields--muted" : ""}`}>
          <Field
            label="Poin minimum untuk diskon"
            type="number"
            suffix="poin"
            value={settings.redeemPointsRequired}
            onChange={(v) => update({ redeemPointsRequired: Number(v) })}
          />
          <Field
            label="Jenis diskon penukaran"
            type="select"
            value={settings.redeemRewardType}
            options={[
              ["discountPercent", "Diskon persen"],
              ["discountFixed", "Diskon nominal"],
            ]}
            onChange={(v) =>
              update({ redeemRewardType: v as LoyaltySettings["redeemRewardType"] })
            }
          />
          <div className="form-grid">
            {settings.redeemRewardType === "discountPercent" && (
              <Field
                label="Diskon penukaran"
                type="number"
                suffix="%"
                value={settings.redeemDiscountPercent}
                onChange={(v) => update({ redeemDiscountPercent: Number(v) })}
              />
            )}
            {settings.redeemRewardType === "discountFixed" && (
              <Field
                label="Diskon nominal penukaran"
                type="number"
                suffix="Rp"
                value={settings.redeemDiscountFixed}
                onChange={(v) => update({ redeemDiscountFixed: Number(v) })}
              />
            )}
          </div>
        </div>
      </LoyaltyCard>

      <div className="loyalty-save-bar">
        <button type="submit" className="btn-primary min-w-[180px]" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
}

type IconTone = "program" | "member" | "points" | "redeem";

function LoyaltyCard({
  icon,
  iconTone,
  title,
  description,
  children,
}: {
  icon: FeatureIconName;
  iconTone: IconTone;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="loyalty-card">
      <div className="loyalty-card-head">
        <div className={`loyalty-card-icon loyalty-card-icon--${iconTone}`}>
          <FeatureIcon name={icon} className="h-5 w-5" />
        </div>
        <div>
          <h2 className="loyalty-card-title">{title}</h2>
          <p className="loyalty-card-desc">{description}</p>
        </div>
      </div>
      <div className="loyalty-card-body">{children}</div>
    </section>
  );
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm font-semibold text-[var(--ink)]">{label}</span>
      <span className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="switch-track" />
        <span className="switch-thumb" />
      </span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "number",
  options,
  suffix,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "number" | "select";
  options?: [string, string][];
  suffix?: string;
}) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {type === "select" ? (
        <select className="input" value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {options?.map(([val, text]) => (
            <option key={val} value={val}>
              {text}
            </option>
          ))}
        </select>
      ) : (
        <div className="form-input-wrap">
          <input
            className={`input ${suffix ? "form-input-with-suffix" : ""}`}
            type="number"
            min={0}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {suffix && <span className="form-input-suffix">{suffix}</span>}
        </div>
      )}
    </div>
  );
}
