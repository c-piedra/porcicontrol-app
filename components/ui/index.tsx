"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_MAP: Record<string, string> = {
    activo: "badge-green",
    vendido: "badge-purple",
    baja: "badge-red",
    proxima: "badge-orange",
    aplicada: "badge-blue",
    vencida: "badge-red",
    pendiente: "badge-orange",
    confirmada: "badge-blue",
    entregada: "badge-blue",
    pagada: "badge-green",
    cancelada: "badge-gray",
    emitida: "badge-orange",
    anulada: "badge-red",
    regular: "badge-blue",
    mayorista: "badge-green",
    ocasional: "badge-gray",
};

const BADGE_LABEL: Record<string, string> = {
    activo: "Activo",
    vendido: "Vendido",
    baja: "Baja",
    proxima: "Próxima",
    aplicada: "Aplicada",
    vencida: "Vencida",
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    entregada: "Entregada",
    pagada: "Pagada",
    cancelada: "Cancelada",
    emitida: "Emitida",
    anulada: "Anulada",
    regular: "Regular",
    mayorista: "Mayorista",
    ocasional: "Ocasional",
};

export function Badge({ estado }: { estado: string }) {
    return (
        <span className={`badge ${BADGE_MAP[estado] ?? "badge-gray"}`}>
            {BADGE_LABEL[estado] ?? estado}
        </span>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color }: { value: number; color?: string }) {
    return (
        <div className="progress-bar">
            <div
                className="progress-fill"
                style={{
                    width: `${Math.min(100, value)}%`,
                    ...(color ? { background: color } : {}),
                }}
            />
        </div>
    );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    min?: string;
    max?: string;
    step?: string;
}

export function Input({
    label, value, onChange, type = "text",
    placeholder, required, min, max, step,
}: InputProps) {
    return (
        <div className="input-group">
            <label className="input-label">
                {label}{required && " *"}
            </label>
            <input
                className="input"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                step={step}
            />
        </div>
    );
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}

export function Select({ label, value, onChange, options, required }: SelectProps) {
    return (
        <div className="input-group">
            <label className="input-label">
                {label}{required && " *"}
            </label>
            <select
                className="input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                style={{ cursor: "pointer" }}
            >
                <option value="" disabled>Seleccionar...</option>
                {options.map((o) => (
                    <option
                        key={o.value}
                        value={o.value}
                        style={{
                            background: "#162B1A",
                            color: "#f0fdf4",
                        }}
                    >
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
interface SheetProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export function Sheet({ title, onClose, children }: SheetProps) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const content = (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                zIndex: 80,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
            }}
        >
            <div style={{
                background: "var(--color-bg-card)",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                border: "1px solid var(--color-border)",
                borderBottom: "none",
                width: "100%",
                maxWidth: 430,
                maxHeight: "90dvh",
                overflowY: "auto",
                padding: "var(--space-5) var(--space-4) var(--space-8)",
                animation: "slideUp var(--dur-base) var(--ease-out)",
            }}>
                <div style={{
                    width: 36, height: 4,
                    background: "var(--color-border-2)",
                    borderRadius: "var(--radius-full)",
                    margin: "0 auto var(--space-4)",
                }} />
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-4)",
                }}>
                    <h2 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--text-lg)",
                        fontWeight: 700,
                        color: "var(--color-text)",
                        margin: 0,
                    }}>
                        {title}
                    </h2>
                    <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 10px", minHeight: 32 }}
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg?: string;
}

export function StatCard({
    label, value, icon,
    iconBg = "var(--color-primary-glow)",
}: StatCardProps) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: iconBg }}>
                {icon}
            </div>
            <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
    message,
    action,
}: {
    message: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="empty-state">
            <div className="empty-icon">
                <span style={{ fontSize: 28 }}>📋</span>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
                {message}
            </p>
            {action}
        </div>
    );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({
    message, onConfirm, onCancel,
}: {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const content = (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 90,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
        }}>
            <div style={{
                background: "var(--color-bg-card)",
                borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
                border: "1px solid var(--color-border)",
                borderBottom: "none",
                width: "100%",
                maxWidth: 430,
                padding: "var(--space-6) var(--space-4) var(--space-8)",
            }}>
                <div style={{
                    width: 36, height: 4,
                    background: "var(--color-border-2)",
                    borderRadius: "var(--radius-full)",
                    margin: "0 auto var(--space-4)",
                }} />
                <p style={{
                    fontSize: "var(--text-base)",
                    marginBottom: "var(--space-5)",
                    color: "var(--color-text-2)",
                }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm}>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}