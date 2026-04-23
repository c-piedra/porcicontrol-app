"use client";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
    const { loginWithGoogle, loading } = useAuth();

    return (
        <div style={{
            minHeight: "100dvh",
            background: "var(--color-bg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-10) var(--space-6)",
        }}>

            {/* Top section */}
            <div />

            {/* Center */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-6)" }}>

                {/* Logo */}
                <div style={{
                    width: 100, height: 100,
                    background: "linear-gradient(135deg, #1B4D2A, #0D2B16)",
                    borderRadius: 28,
                    display: "grid", placeItems: "center",
                    border: "1px solid rgba(34,197,94,0.3)",
                    fontSize: 52,
                }}>
                    🐷
                </div>

                {/* Title */}
                <div style={{ textAlign: "center" }}>
                    <h1 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--text-3xl)",
                        fontWeight: 800,
                        color: "var(--color-text)",
                        lineHeight: 1.1,
                        marginBottom: "var(--space-2)",
                    }}>
                        Porci<span style={{ color: "var(--color-primary)" }}>control</span>
                    </h1>
                    <p style={{
                        fontSize: "var(--text-base)",
                        color: "var(--color-text-3)",
                        lineHeight: 1.5,
                    }}>
                        Tu granja en orden.
                    </p>
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", width: "100%" }}>
                    {[
                        { icon: "🐷", text: "Gestión de lotes y chanchos" },
                        { icon: "💉", text: "Control de vacunas y tratamientos" },
                        { icon: "💰", text: "Ventas, pagos y facturas" },
                        { icon: "📊", text: "Reportes y estadísticas" },
                    ].map(({ icon, text }) => (
                        <div key={text} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--space-3)",
                            background: "var(--color-bg-card)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--space-3) var(--space-4)",
                        }}>
                            <span style={{ fontSize: 20 }}>{icon}</span>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <button
                    onClick={loginWithGoogle}
                    disabled={loading}
                    style={{
                        width: "100%",
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border-2)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3) var(--space-4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "var(--space-3)",
                        cursor: "pointer",
                        minHeight: 52,
                        opacity: loading ? 0.7 : 1,
                        transition: "all 150ms",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                    </svg>
                    <span style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "var(--text-base)",
                        fontWeight: 600,
                        color: "var(--color-text)",
                    }}>
                        Continuar con Google
                    </span>
                </button>

                <button
                    className="btn btn-primary"
                    onClick={loginWithGoogle}
                    disabled={loading}
                    style={{ width: "100%", minHeight: 52, fontSize: "var(--text-base)" }}
                >
                    Comenzar →
                </button>

                <p style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                    textAlign: "center",
                    lineHeight: 1.5,
                }}>
                    Al continuar aceptás los términos de uso y política de privacidad.
                </p>
            </div>

        </div>
    );
}