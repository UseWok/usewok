import React from "react";
import AuthShell from "@/components/AuthShell.jsx";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <AuthShell>
      <div>
        {/* Heading */}
        <div style={{ marginBottom: 28 }}>
          {Icon && (
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(249,87,56,0.12)", border: "1px solid rgba(249,87,56,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon style={{ width: 18, height: 18, color: "#F95738" }} />
            </div>
          )}
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.6 }}>{subtitle}</p>}
        </div>

        {/* Slot */}
        {children}

        {/* Footer */}
        {footer && (
          <div style={{ marginTop: 24, fontSize: 13, color: "#555", textAlign: "center" }}>
            {footer}
          </div>
        )}
      </div>
    </AuthShell>
  );
}