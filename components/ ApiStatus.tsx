"use client";
import { useState } from "react";
export function ApiStatus() {
    const [status, setStatus] =
        useState("Not checked");
    const [loading, setLoading] =
        useState(false);
    const [error, setError] =
        useState("");
    async function checkApi() {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(
                "http://127.0.0.1:5000/health");
            if (!response.ok) {
                throw new Error("API request failed");
            }
            const data = await response.json();
            setStatus(data.status);
        } catch {
            setError("Cannot connect to API");
        } finally {
            setLoading(false);
        }
    }
    return (
       <div className="ux-card">
      <div className="ux-card-header-icon" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🔌</span>
        <h3 style={{ margin: 0 }}>Backend API</h3>
      </div>
      <p className="ux-muted" style={{ fontSize: "13px", margin: "6px 0 14px" }}>
        ตรวจสอบสถานะการเชื่อมต่อเซิร์ฟเวอร์ AI
      </p>

      <div style={{ marginBottom: "16px" }}>
        <span className={`ux-badge ${status === "Active" ? "ux-badge-green" : "ux-badge-orange"}`}>
          ● {status}
        </span>
      </div>
            <button
                type="button"
                className="ux-button"
                onClick={checkApi}
                disabled={loading}
            >
                {loading
                    ? "Checking..."
                    : "Check API"}
            </button>{error && (
                <div
                    className="ux-error"
                    role="alert"
                >
                    {error}
                </div>
            )}
      </div>
    );
}