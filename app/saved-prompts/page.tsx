"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

type Prompt = {
  id: number;
  title: string;
  prompt_text: string;
  category: string | null;
  created_at: string;
};

export default function SavedPromptsPage() {
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<Prompt[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/prompts");
      if (!response.ok) throw new Error("GET failed");
      const data: { prompts: Prompt[] } = await response.json();
      setItems(data.prompts);
      setError("");
    } catch {
      setError("Cannot load prompts. Check PostgreSQL.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function clearForm() {
    setTitle("");
    setPromptText("");
    setCategory("");
    setEditingId(null);
  }

  function edit(item: Prompt) {
    setTitle(item.title);
    setPromptText(item.prompt_text);
    setCategory(item.category || "");
    setEditingId(item.id);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !promptText.trim()) {
      setError("Title and Prompt are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const isEdit = editingId !== null;
    try {
      const response = await fetch(
        isEdit ? `/api/prompts/${editingId}` : "/api/prompts",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, promptText, category }),
        }
      );

      if (!response.ok) throw new Error("Save failed");
      clearForm();
      await load();
      setMessage(isEdit ? "Prompt updated." : "Prompt saved.");
    } catch {
      setError("Cannot save prompt.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this prompt?")) return;
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      if (editingId === id) clearForm();
      await load();
      setMessage("Prompt deleted.");
    } catch {
      setError("Cannot delete prompt.");
    }
  }

  return (
    <main className="sp-page">
  <header className="sp-hero">
    <div className="sp-container sp-hero-inner">
      <div>
        <p className="sp-eyebrow">BIRD DETECTION LOGS</p>
        <h1>สรุปผลการตรวจจับนกประจำวัน</h1>
        <p className="sp-intro">รายงานและประวัติการพบเห็นนกในระบบ AI ประจำสวน</p>
      </div>
      <Link href="/" className="sp-back">
        ← กลับหน้าหลัก
      </Link>
    </div>
  </header>

  <div className="sp-container sp-layout">
    {/* ฝั่งซ้าย: ฟอร์มเพิ่ม / แก้ไขบันทึก */}
    <section className="sp-panel sp-editor" aria-labelledby="form-title">
      <p className="sp-kicker">01 / ADD DETECTION LOG</p>
      <h2 id="form-title">
        {editingId === null ? "เพิ่มรายการบันทึก" : "แก้ไขรายการบันทึก"}
      </h2>
      <p className="sp-helper">กรอกข้อมูลการตรวจจับนกเพื่อบันทึกเก็บไว้ในระบบ</p>

      <form className="sp-form" onSubmit={save}>
        <label htmlFor="title">
          โซนที่พบ <span aria-hidden="true">*</span>
        </label>
        <input
          id="title"
          value={title}
          maxLength={200}
          required
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น โซน A (แปลงผักสวนครัว)"
        />

        <label htmlFor="prompt">
          รายละเอียดการตรวจจับ <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="prompt"
          value={promptText}
          required
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="เช่น พบฝูงนกพิราบ 3 ตัว ระบบเปิดสัญญาณอัลตราโซนิกไล่อัตโนมัติ"
        />

        <label htmlFor="category">
          ประเภทการแจ้งเตือน <span className="sp-optional">Optional</span>
        </label>
        <input
          id="category"
          value={category}
          maxLength={100}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="เช่น นกพิราบ, นกเอี้ยง, เฝ้าระวัง"
        />

        <div className="sp-actions">
          <button type="submit" className="sp-primary" disabled={saving}>
            {saving
              ? "กำลังบันทึก..."
              : editingId === null
              ? "บันทึกข้อมูล"
              : "อัปเดตข้อมูล"}
          </button>
          {editingId !== null && (
            <button type="button" className="sp-secondary" onClick={clearForm}>
              ยกเลิกการแก้ไข
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="sp-feedback sp-error" role="alert">
          ⚠️ {error}
        </p>
      )}
      {message && (
        <p className="sp-feedback sp-success" role="status">
          ✅ {message}
        </p>
      )}
    </section>

    {/* ฝั่งขวา: รายการประวัติที่บันทึกไว้ */}
    <section className="sp-library" aria-labelledby="library-title">
      <div className="sp-library-head">
        <div>
          <p className="sp-kicker">02 / RECENT LOGS</p>
          <h2 id="library-title">ประวัติการบันทึกทั้งหมด</h2>
        </div>
        <span className="sp-count">{items.length} รายการ</span>
      </div>

      {loading && (
        <p className="sp-empty" role="status">
          กำลังโหลดข้อมูล...
        </p>
      )}

      {!loading && items.length === 0 && (
        <div className="sp-empty">
          <strong>ยังไม่มีประวัติการบันทึก</strong>
          <p>รายการบันทึกแรกของคุณจะแสดงที่นี่เมื่อคุณกดบันทึกข้อมูล</p>
        </div>
      )}

      <div className="sp-list">
        {!loading &&
          items.map((item) => (
            <article className="sp-item" key={item.id}>
              <div className="sp-item-top">
                <h3>{item.title}</h3>
                <span className="sp-tag">{item.category || "ทั่วไป"}</span>
              </div>
              <p className="sp-prompt-text">{item.prompt_text}</p>
              <div className="sp-item-actions">
                <button type="button" onClick={() => edit(item)}>
                  ✏️ แก้ไข
                </button>
                <button
                  type="button"
                  className="sp-delete"
                  onClick={() => void remove(item.id)}
                >
                  🗑️ ลบ
                </button>
              </div>
            </article>
          ))}
      </div>
    </section>
  </div>
</main>);}