import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, FileText, Trash2, Save, Download, ChevronLeft, Sun, CloudRain, Snowflake, Wind, ThermometerSnowflake, Check, X, Eraser, Share2, FolderOpen, Copy, ImagePlus, Camera } from "lucide-react";

// ============================================================
// Bau-Tagesbericht — Tablet-App für Zimmerei Schwaighofer GmbH
// ============================================================

const GREEN = "#5BA83A";
const DARKGREEN = "#3E7A28";
const INK = "#1f2417";
const LOGO = "data:image/jpeg;base64,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";

const emptyReport = () => ({
  id: "rep_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
  datum: new Date().toISOString().slice(0, 10),
  bauvorhaben: "",
  bauführer: "",
  witterung: { sonne: false, regen: false, frost: false, wind: false, schnee: false },
  temperatur: "",
  arbeiter: {
    vorarbeiter: { n: "", std: "", namen: "" },
    facharbeiter: { n: "", std: "", namen: "" },
    hilfsarbeiter: { n: "", std: "", namen: "" },
    lehrling: { n: "", std: "", namen: "" },
    kraftfahrer: { n: "", std: "", namen: "" },
  },
  leistungsergebnisse: [""],   // Liste von Punkten
  material: "",
  regieLeistungen: [""],       // Liste von Punkten
  regieMaterial: "",
  fotos: [],          // [{ id, dataUrl, kommentar }]
  signature: null, // dataURL
  updatedAt: Date.now(),
});

// ---------- helpers ----------
function parseNum(v) {
  if (v == null) return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}
// Gesamtstunden = Summe (Anzahl × Stunden) je Kategorie.
// Wenn keine Anzahl angegeben ist, zählt die Stundenzahl einfach 1×.
function totalHours(arbeiter) {
  return Object.values(arbeiter).reduce((sum, a) => {
    const std = parseNum(a.std);
    if (!std) return sum;
    const n = parseNum(a.n);
    return sum + std * (n > 0 ? n : 1);
  }, 0);
}
function fmtHours(h) {
  return Number.isInteger(h) ? String(h) : h.toFixed(1).replace(".", ",");
}

function Logo({ small }) {
  return (
    <img src={LOGO} alt="Zimmerei Schwaighofer GmbH"
      style={{ height: small ? 44 : 70, width: "auto", display: "block", borderRadius: 6 }} />
  );
}

// ---------- persistent storage helpers ----------

// localStorage-Wrapper, der dieselbe API wie window.storage (Artefakt) anbietet.
// Ermöglicht Offline-Speicherung direkt im Browser des Tablets.
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const v = window.localStorage.getItem(key);
      return v === null ? null : { key, value: v };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      window.localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return { keys, prefix };
    },
  };
}

const INDEX_KEY = "btb:index";

async function loadIndex() {
  try {
    const res = await window.storage.get(INDEX_KEY);
    return res ? JSON.parse(res.value) : [];
  } catch {
    return [];
  }
}
async function saveIndex(idx) {
  try { await window.storage.set(INDEX_KEY, JSON.stringify(idx)); } catch (e) { console.error(e); }
}
async function loadReport(id) {
  try {
    const res = await window.storage.get("btb:rep:" + id);
    if (!res) return null;
    const rep = JSON.parse(res.value);
    // Migration: leistungsergebnisse von String -> Array
    if (!Array.isArray(rep.leistungsergebnisse)) {
      const str = (rep.leistungsergebnisse || "").trim();
      rep.leistungsergebnisse = str ? str.split("\n").map(s => s.trim()).filter(Boolean) : [""];
      if (rep.leistungsergebnisse.length === 0) rep.leistungsergebnisse = [""];
    }
    // Migration: neue Regie-Felder ergänzen
    if (!Array.isArray(rep.regieLeistungen)) rep.regieLeistungen = [""];
    if (rep.regieMaterial === undefined) rep.regieMaterial = "";
    if (!Array.isArray(rep.fotos)) rep.fotos = [];
    // Migration: namen-Feld in Arbeiter-Kategorien ergänzen
    if (rep.arbeiter) {
      Object.keys(rep.arbeiter).forEach(k => {
        if (rep.arbeiter[k] && rep.arbeiter[k].namen === undefined) rep.arbeiter[k].namen = "";
      });
    }
    return rep;
  } catch { return null; }
}
async function saveReport(rep) {
  try { await window.storage.set("btb:rep:" + rep.id, JSON.stringify(rep)); } catch (e) { console.error(e); }
}
async function deleteReport(id) {
  try { await window.storage.delete("btb:rep:" + id); } catch (e) { console.error(e); }
}

// ============================================================
// Signature pad
// ============================================================
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [hasInk, setHasInk] = useState(!!value);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#16324f";
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; last.current = pos(e); };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setHasInk(true);
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div style={{ position: "relative", border: "2px solid #c9cabb", borderRadius: 12, background: "#fdfdf8", overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 160, touchAction: "none", display: "block" }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
        {!hasInk && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", color: "#b7b8a8", fontSize: 16, fontStyle: "italic" }}>
            Hier mit Finger oder Stift unterschreiben
          </div>
        )}
      </div>
      <button onClick={clear} style={{ ...btnGhost, marginTop: 10 }}>
        <Eraser size={18} /> Unterschrift löschen
      </button>
    </div>
  );
}

// ============================================================
// Reusable field components (big touch targets)
// ============================================================
const btnGhost = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "10px 16px", borderRadius: 10, border: "2px solid #c9cabb",
  background: "#fff", color: INK, fontSize: 15, fontWeight: 600, cursor: "pointer",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 15, fontWeight: 700, color: DARKGREEN, marginBottom: 6, letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px 16px", fontSize: 18, borderRadius: 12,
  border: "2px solid #c9cabb", background: "#fff", color: INK, boxSizing: "border-box",
  fontFamily: "inherit",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function TextArea(props) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.4, ...(props.style || {}) }} />;
}

function WeatherToggle({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      padding: "14px 8px", borderRadius: 14, cursor: "pointer", minWidth: 84, flex: 1,
      border: active ? `3px solid ${GREEN}` : "2px solid #c9cabb",
      background: active ? "#eef7e6" : "#fff",
      color: active ? DARKGREEN : "#6b6c5c", fontWeight: 700, fontSize: 14,
      transition: "all .15s",
    }}>
      <Icon size={26} />
      {label}
    </button>
  );
}

// Punkte-Liste: jede Zeile ist ein Listenpunkt, Hinzufügen/Entfernen möglich
function BulletListInput({ items, onChange, placeholder }) {
  const list = items && items.length ? items : [""];
  const update = (i, val) => {
    const next = [...list];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...list, ""]);
  const remove = (i) => {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [""]);
  };
  const onKey = (e, i) => {
    if (e.key === "Enter") { e.preventDefault(); const next = [...list]; next.splice(i + 1, 0, ""); onChange(next);
      setTimeout(() => { const el = document.querySelector(`[data-bullet="${i + 1}"]`); if (el) el.focus(); }, 30); }
  };
  return (
    <div>
      {list.map((val, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ color: GREEN, fontSize: 22, fontWeight: 800, lineHeight: 1, flexShrink: 0, width: 16, textAlign: "center" }}>•</span>
          <input
            data-bullet={i}
            value={val}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => onKey(e, i)}
            placeholder={i === 0 ? placeholder : "Weiterer Punkt…"}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => remove(i)} style={{ ...btnGhost, padding: 12, borderColor: "#e0c4c4", color: "#b04a4a", flexShrink: 0 }} title="Punkt entfernen">
            <X size={20} />
          </button>
        </div>
      ))}
      <button onClick={add} style={{ ...btnGhost, borderColor: GREEN, color: DARKGREEN, marginTop: 2 }}>
        <Plus size={18} /> Punkt hinzufügen
      </button>
    </div>
  );
}

// ============================================================
// Editor view
// ============================================================
// Autocomplete für Bauvorhaben: zeigt passende bereits angelegte Baustellen
// Bild-Upload mit Vorschau und Kommentar pro Foto.
// Bilder werden vor dem Speichern auf max. 1280px verkleinert (für Speicher und PDF).
async function fileToCompressedDataURL(file, maxDim = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PhotoUpload({ fotos, onChange }) {
  const inputRef = useRef(null);
  const list = fotos || [];

  const onPick = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const additions = [];
    for (const f of files) {
      try {
        const dataUrl = await fileToCompressedDataURL(f);
        additions.push({ id: "foto_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), dataUrl, kommentar: "" });
      } catch (err) { console.error(err); }
    }
    onChange([...list, ...additions]);
    e.target.value = "";
  };

  const updateKommentar = (id, val) => onChange(list.map(f => f.id === id ? { ...f, kommentar: val } : f));
  const remove = (id) => onChange(list.filter(f => f.id !== id));

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick}
        style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: list.length ? 14 : 0 }}>
        <button onClick={() => inputRef.current?.click()}
          style={{ ...btnGhost, borderColor: GREEN, color: DARKGREEN }}>
          <ImagePlus size={20} /> Foto hinzufügen
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {list.map(f => (
          <div key={f.id} style={{ border: "2px solid #c9cabb", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
            <div style={{ position: "relative", paddingTop: "75%", background: "#000" }}>
              <img src={f.dataUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => remove(f.id)} title="Foto entfernen"
                style={{ position: "absolute", top: 8, right: 8, border: "none", background: "rgba(0,0,0,.6)", color: "#fff", borderRadius: 999, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <input
              value={f.kommentar || ""}
              onChange={(e) => updateKommentar(f.id, e.target.value)}
              placeholder="Bildbeschreibung…"
              style={{ ...inputStyle, border: "none", borderTop: "1px solid #e3e3d4", padding: "10px 12px", fontSize: 14, borderRadius: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


// Autocomplete für Bauvorhaben: zeigt passende bereits angelegte Baustellen
function BauvorhabenAutocomplete({ value, onChange, suggestions }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, []);

  const q = (value || "").trim().toLowerCase();
  const list = (suggestions || [])
    .filter(s => s && s.trim())
    .filter(s => !q || s.toLowerCase().includes(q))
    .filter(s => s.toLowerCase() !== q)
    .slice(0, 6);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        value={value || ""}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="z. B. FH Rosenheim"
        style={inputStyle}
      />
      {open && list.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "#fff", border: "2px solid #c9cabb", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,.08)", zIndex: 30, overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", fontSize: 12, color: "#8a8b79", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", background: "#fbfbf4", borderBottom: "1px solid #e3e3d4" }}>
            Bestehende Baustellen
          </div>
          {list.map((s, i) => (
            <button key={s} onClick={() => { onChange(s); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                padding: "12px 14px", border: "none", background: "#fff", cursor: "pointer", fontSize: 16,
                borderTop: i === 0 ? "none" : "1px solid #f0f1e6", color: INK, fontFamily: "inherit",
              }}>
              <FolderOpen size={18} color={GREEN} />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Editor({ report, onChange, onBack, onSave, onExport, existingFolders }) {
  const r = report;
  const set = (patch) => onChange({ ...r, ...patch });
  const setArb = (key, sub, val) => set({ arbeiter: { ...r.arbeiter, [key]: { ...r.arbeiter[key], [sub]: val } } });
  const toggleW = (k) => set({ witterung: { ...r.witterung, [k]: !r.witterung[k] } });

  const arbRows = [
    ["vorarbeiter", "Vorarbeiter"], ["facharbeiter", "Facharbeiter"], ["hilfsarbeiter", "Hilfsarbeiter"],
    ["lehrling", "Lehrling"], ["kraftfahrer", "Kraftfahrer inkl. LKW"],
  ];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fbfbf4", borderBottom: "2px solid #e3e3d4", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={btnGhost}><ChevronLeft size={20} /> Zurück</button>
        <div style={{ flex: 1 }} />
        <button onClick={onSave} style={{ ...btnGhost, background: GREEN, color: "#fff", borderColor: GREEN, padding: "12px 22px", fontSize: 16 }}>
          <Save size={18} /> Speichern
        </button>
        <button onClick={onExport} style={{ ...btnGhost, borderColor: DARKGREEN, color: DARKGREEN, padding: "12px 18px", fontSize: 16 }}>
          <Download size={18} /> PDF
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "Oswald, sans-serif", fontSize: 30, color: INK, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 1 }}>Bau-Tagesbericht</h2>
          </div>
          <Logo />
        </div>
        <div style={{ height: 2, background: "#e3e3d4", margin: "16px 0 24px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Datum"><TextInput type="date" value={r.datum} onChange={e => set({ datum: e.target.value })} /></Field>
          <Field label="Temperatur (°C)"><TextInput type="text" inputMode="numeric" value={r.temperatur} onChange={e => set({ temperatur: e.target.value })} placeholder="z. B. 4" /></Field>
        </div>
        <Field label="Bauvorhaben"><BauvorhabenAutocomplete value={r.bauvorhaben} onChange={(v) => set({ bauvorhaben: v })} suggestions={existingFolders} /></Field>
        <Field label="Verantwortlicher Bauführer"><TextInput value={r.bauführer} onChange={e => set({ bauführer: e.target.value })} placeholder="Name" /></Field>

        <Field label="Witterung">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <WeatherToggle active={r.witterung.sonne} onClick={() => toggleW("sonne")} icon={Sun} label="Sonne" />
            <WeatherToggle active={r.witterung.regen} onClick={() => toggleW("regen")} icon={CloudRain} label="Regen" />
            <WeatherToggle active={r.witterung.frost} onClick={() => toggleW("frost")} icon={ThermometerSnowflake} label="Frost" />
            <WeatherToggle active={r.witterung.wind} onClick={() => toggleW("wind")} icon={Wind} label="Wind" />
            <WeatherToggle active={r.witterung.schnee} onClick={() => toggleW("schnee")} icon={Snowflake} label="Schnee" />
          </div>
        </Field>

        <Field label="Anzahl der beschäftigten Arbeiter">
          <div style={{ border: "2px solid #c9cabb", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", background: "#eef0e6", fontWeight: 700, fontSize: 13, color: DARKGREEN }}>
              <div style={{ padding: "10px 14px" }}>Kategorie</div>
              <div style={{ padding: "10px 14px", textAlign: "center" }}>Anzahl</div>
              <div style={{ padding: "10px 14px", textAlign: "center" }}>Stunden</div>
            </div>
            {arbRows.map(([key, lbl], i) => (
              <div key={key} style={{ borderTop: "1px solid #e3e3d4", background: i % 2 ? "#fbfbf4" : "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", alignItems: "center" }}>
                  <div style={{ padding: "8px 14px", fontWeight: 600, fontSize: 15 }}>{lbl}</div>
                  <div style={{ padding: 8 }}>
                    <input inputMode="numeric" value={r.arbeiter[key].n} onChange={e => setArb(key, "n", e.target.value)}
                      style={{ ...inputStyle, padding: "10px", textAlign: "center", fontSize: 16 }} />
                  </div>
                  <div style={{ padding: 8 }}>
                    <input inputMode="decimal" value={r.arbeiter[key].std} onChange={e => setArb(key, "std", e.target.value)}
                      style={{ ...inputStyle, padding: "10px", textAlign: "center", fontSize: 16 }} />
                  </div>
                </div>
                <div style={{ padding: "0 8px 10px" }}>
                  <input value={r.arbeiter[key].namen || ""} onChange={e => setArb(key, "namen", e.target.value)}
                    placeholder="Namen (mit Komma trennen)…"
                    style={{ ...inputStyle, padding: "10px 12px", fontSize: 15 }} />
                </div>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", borderTop: "2px solid #c9cabb", background: "#eef7e6", alignItems: "center" }}>
              <div style={{ padding: "12px 14px", fontWeight: 800, fontSize: 15, color: DARKGREEN }}>Gesamt</div>
              <div style={{ padding: "12px 8px" }} />
              <div style={{ padding: "12px 8px", textAlign: "center", fontWeight: 800, fontSize: 18, color: DARKGREEN }}>
                {fmtHours(totalHours(r.arbeiter))} Std.
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9a9b89", margin: "6px 2px 0" }}>
            Berechnet als Anzahl × Stunden je Kategorie (z. B. 2 Mann × 2 Std = 4 Std).
          </p>
        </Field>

        <Field label="Leistungsergebnisse"><BulletListInput items={r.leistungsergebnisse} onChange={(v) => set({ leistungsergebnisse: v })} placeholder="Durchgeführte Arbeit eintragen…" /></Field>
        <Field label="Material"><TextArea value={r.material} onChange={e => set({ material: e.target.value })} /></Field>
        <Field label="Regie-Leistungen"><BulletListInput items={r.regieLeistungen} onChange={(v) => set({ regieLeistungen: v })} placeholder="Regie-Leistung eintragen…" /></Field>
        <Field label="Regie-Material"><TextArea value={r.regieMaterial} onChange={e => set({ regieMaterial: e.target.value })} /></Field>

        <Field label="Fotos zum Baufortschritt">
          <PhotoUpload fotos={r.fotos} onChange={(v) => set({ fotos: v })} />
        </Field>

        <Field label="Unterschrift Bauführer/-leiter">
          <SignaturePad value={r.signature} onChange={(s) => set({ signature: s })} />
        </Field>
      </div>
    </div>
  );
}

// ============================================================
// Folder list view (Baustellen)
// ============================================================
function FolderList({ folders, onOpenFolder, onNew, onDeleteFolder }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 18px 120px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 38, color: INK, margin: 0, textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1 }}>Baustellen</h1>
          <div style={{ marginTop: 10 }}><Logo small /></div>
        </div>
        <button onClick={onNew} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", borderRadius: 14, border: "none", background: GREEN, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(91,168,58,.35)" }}>
          <Plus size={24} /> Neuer Bericht
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        {folders.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#9a9b89" }}>
            <FolderOpen size={56} style={{ opacity: .4 }} />
            <p style={{ fontSize: 18, marginTop: 16 }}>Noch keine Baustellen. Tippe auf „Neuer Bericht“ und trage ein Bauvorhaben ein.</p>
          </div>
        )}
        {folders.map(f => (
          <div key={f.name} onClick={() => onOpenFolder(f.name)} style={{
            display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", marginBottom: 12,
            background: "#fff", border: "2px solid #e3e3d4", borderRadius: 16, cursor: "pointer",
          }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: "#eef7e6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FolderOpen size={26} color={GREEN} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name}
              </div>
              <div style={{ fontSize: 14, color: "#8a8b79", marginTop: 2 }}>
                {f.count} {f.count === 1 ? "Bericht" : "Berichte"} · zuletzt {f.latest}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(f.name); }} style={{ ...btnGhost, padding: 12, borderColor: "#e0c4c4", color: "#b04a4a" }} title="Baustelle mit allen Berichten löschen">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// List view (Berichte einer Baustelle)
// ============================================================
function ReportList({ folderName, items, onOpen, onNew, onDelete, onDuplicate, onBack }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 18px 120px" }}>
      <button onClick={onBack} style={{ ...btnGhost, marginBottom: 16 }}><ChevronLeft size={20} /> Baustellen</button>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 14, color: GREEN, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Baustelle</div>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 34, color: INK, margin: "2px 0 0", lineHeight: 1.05 }}>{folderName}</h1>
        </div>
        <button onClick={() => onNew(folderName)} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", borderRadius: 14, border: "none", background: GREEN, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(91,168,58,.35)" }}>
          <Plus size={24} /> Neuer Bericht
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#9a9b89" }}>
            <FileText size={56} style={{ opacity: .4 }} />
            <p style={{ fontSize: 18, marginTop: 16 }}>Noch keine Berichte für diese Baustelle.</p>
          </div>
        )}
        {items.map(it => (
          <div key={it.id} onClick={() => onOpen(it.id)} style={{
            display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", marginBottom: 12,
            background: "#fff", border: "2px solid #e3e3d4", borderRadius: 16, cursor: "pointer",
          }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: "#eef7e6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={26} color={GREEN} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.datum}
              </div>
              <div style={{ fontSize: 14, color: "#8a8b79", marginTop: 2 }}>
                {it.bauführer ? "Bauführer: " + it.bauführer : "Kein Bauführer eingetragen"}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(it.id); }} style={{ ...btnGhost, padding: 12, borderColor: "#c9cabb", color: DARKGREEN }} title="Als Vorlage duplizieren">
              <Copy size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(it.id); }} style={{ ...btnGhost, padding: 12, borderColor: "#e0c4c4", color: "#b04a4a" }}>
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PDF export (jsPDF loaded from CDN)
// ============================================================
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      // schon im DOM – kurz warten bis verfügbar
      let tries = 0;
      const iv = setInterval(() => {
        if (window.jspdf && window.jspdf.jsPDF) { clearInterval(iv); resolve(); }
        else if (++tries > 50) { clearInterval(iv); reject(new Error("jsPDF nicht geladen")); }
      }, 100);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Skript konnte nicht geladen werden (Internet?)"));
    document.body.appendChild(s);
    setTimeout(() => { if (!(window.jspdf && window.jspdf.jsPDF)) reject(new Error("Zeitüberschreitung beim Laden")); }, 8000);
  });
}

async function exportPDF(r) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 40;
  // Mehr Platz oben für Logo, damit Trennlinie es nicht durchschneidet.
  // (5 mm zusätzlicher Abstand unter dem Logo)
  let y = 104;

  // Logo komplett im oberen Bereich (über der Trennlinie)
  const LOGO_W = 140, LOGO_H = 60;
  try { doc.addImage(LOGO, "JPEG", W - ML - LOGO_W, 30, LOGO_W, LOGO_H); } catch (e) {}
  doc.setTextColor(40, 40, 30);
  doc.setFont("helvetica", "bold"); doc.setFontSize(24);
  doc.text("BAU-TAGESBERICHT", ML, 65);

  // Trennlinie unter Header
  doc.setDrawColor(200); doc.line(ML, y, W - ML, y); y += 18;

  const line = (label, val) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(label, ML, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    const lines = doc.splitTextToSize(val || "—", W - ML - 130);
    doc.text(lines, ML + 120, y);
    y += Math.max(18, lines.length * 14 + 4);
  };

  line("Datum:", r.datum);
  line("Bauvorhaben:", r.bauvorhaben);
  line("Bauführer:", r.bauführer);
  const wit = Object.entries(r.witterung).filter(([, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(", ");
  line("Witterung:", wit + (r.temperatur ? `  (${r.temperatur} °C)` : ""));

  // Arbeiter-Tabelle
  y += 8; doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("Anzahl der beschäftigten Arbeiter", ML, y); y += 12;

  const TBL_W = W - 2 * ML;
  const colKategorie = 140;
  const colAnzahl = 60;
  const colStunden = 70;
  const colNamen = TBL_W - colKategorie - colAnzahl - colStunden;
  const xKat = ML;
  const xAnz = xKat + colKategorie;
  const xStd = xAnz + colAnzahl;
  const xNam = xStd + colStunden;

  // Tabellenkopf
  const headerY = y;
  doc.setFillColor(238, 240, 230); // hellgrün
  doc.rect(ML, headerY, TBL_W, 20, "F");
  doc.setDrawColor(180); doc.setLineWidth(0.5);
  doc.rect(ML, headerY, TBL_W, 20);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(62, 122, 40);
  doc.text("Kategorie", xKat + 6, headerY + 14);
  doc.text("Anzahl", xAnz + colAnzahl / 2, headerY + 14, { align: "center" });
  doc.text("Stunden", xStd + colStunden / 2, headerY + 14, { align: "center" });
  doc.text("Namen", xNam + 6, headerY + 14);
  y = headerY + 20;
  doc.setTextColor(40, 40, 30);

  const rows = [
    ["vorarbeiter", "Vorarbeiter"],
    ["facharbeiter", "Facharbeiter"],
    ["hilfsarbeiter", "Hilfsarbeiter"],
    ["lehrling", "Lehrling"],
    ["kraftfahrer", "Kraftfahrer inkl. LKW"],
  ];
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  rows.forEach(([k, lbl], i) => {
    const a = r.arbeiter[k] || {};
    const namen = (a.namen || "").trim();
    const nameLines = doc.splitTextToSize(namen || "—", colNamen - 12);
    const rowH = Math.max(20, nameLines.length * 12 + 8);
    if (y + rowH > H - 60) { doc.addPage(); y = 50; }
    // Zeilen-Hintergrund (zebra)
    if (i % 2 === 0) {
      doc.setFillColor(251, 251, 244);
      doc.rect(ML, y, TBL_W, rowH, "F");
    }
    doc.setDrawColor(225); doc.setLineWidth(0.5);
    doc.rect(ML, y, TBL_W, rowH);
    // Spalten-Trenner
    [xAnz, xStd, xNam].forEach(x => doc.line(x, y, x, y + rowH));
    // Inhalt
    doc.setTextColor(40, 40, 30);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(lbl, xKat + 6, y + 14);
    doc.text(a.n || "—", xAnz + colAnzahl / 2, y + 14, { align: "center" });
    doc.text(a.std || "—", xStd + colStunden / 2, y + 14, { align: "center" });
    nameLines.forEach((ln, j) => doc.text(ln, xNam + 6, y + 14 + j * 12));
    y += rowH;
  });

  // Gesamt-Zeile
  if (y + 22 > H - 60) { doc.addPage(); y = 50; }
  doc.setFillColor(238, 247, 230);
  doc.rect(ML, y, TBL_W, 22, "F");
  doc.setDrawColor(180); doc.rect(ML, y, TBL_W, 22);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(62, 122, 40);
  doc.text("Gesamt", xKat + 6, y + 15);
  // Gesamtstunden berechnen
  const parse = (v) => { const n = parseFloat(String(v || "").replace(",", ".")); return isNaN(n) ? 0 : n; };
  let total = 0;
  Object.values(r.arbeiter || {}).forEach(a => {
    const std = parse(a.std); if (!std) return;
    const n = parse(a.n); total += std * (n > 0 ? n : 1);
  });
  const totalStr = (Number.isInteger(total) ? String(total) : total.toFixed(1).replace(".", ",")) + " Std.";
  doc.text(totalStr, xNam + colNamen - 6, y + 15, { align: "right" });
  doc.setTextColor(40, 40, 30);
  y += 30;

  // Absatz / Leerraum zwischen Tabelle und Leistungsergebnissen (~5 mm)
  y += 14;

  const block = (label, val) => {
    if (y > H - 100) { doc.addPage(); y = 50; }
    y += 6; doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(label, ML, y); y += 15;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const lines = doc.splitTextToSize(val || "—", W - 2 * ML);
    doc.text(lines, ML, y); y += lines.length * 13 + 6;
  };
  const bulletBlock = (label, arr) => {
    if (y > H - 100) { doc.addPage(); y = 50; }
    y += 6; doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(label, ML, y); y += 15;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    const items = Array.isArray(arr) ? arr.filter(p => p && p.trim()) : [];
    if (items.length === 0) { doc.text("—", ML, y); y += 14; return; }
    items.forEach(p => {
      if (y > H - 60) { doc.addPage(); y = 50; }
      const lines = doc.splitTextToSize(p, W - 2 * ML - 16);
      doc.text("•", ML + 2, y);
      doc.text(lines, ML + 16, y);
      y += lines.length * 13 + 3;
    });
  };
  bulletBlock("Leistungsergebnisse", r.leistungsergebnisse);
  block("Material", r.material);
  bulletBlock("Regie-Leistungen", r.regieLeistungen);
  block("Regie-Material", r.regieMaterial);

  // Unterschrift
  if (y > H - 160) { doc.addPage(); y = 50; }
  y += 24;
  if (r.signature) {
    try { doc.addImage(r.signature, "PNG", ML, y, 180, 70); } catch (e) {}
  }
  doc.line(ML, y + 80, ML + 220, y + 80);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Unterschrift des Bauführers/-leiters", ML, y + 92);

  // Foto-Seite(n)
  const fotos = Array.isArray(r.fotos) ? r.fotos.filter(f => f && f.dataUrl) : [];
  if (fotos.length > 0) {
    doc.addPage();
    let py = 50;
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(40, 40, 30);
    doc.text("Baufortschritt – Fotos", ML, py); py += 20;
    doc.setDrawColor(200); doc.line(ML, py, W - ML, py); py += 16;

    // 2 Spalten Layout
    const gap = 16;
    const cellW = (W - 2 * ML - gap) / 2;
    const imgH = cellW * 0.72;
    const cellH = imgH + 36; // Bild + Beschriftung
    for (let i = 0; i < fotos.length; i++) {
      const col = i % 2;
      if (col === 0 && py + cellH > H - 40) { doc.addPage(); py = 50; }
      const x = ML + col * (cellW + gap);
      try { doc.addImage(fotos[i].dataUrl, "JPEG", x, py, cellW, imgH); } catch (e) {}
      doc.setDrawColor(220); doc.rect(x, py, cellW, imgH);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
      const cap = (fotos[i].kommentar || "").trim();
      if (cap) {
        const capLines = doc.splitTextToSize(cap, cellW);
        doc.text(capLines.slice(0, 2), x, py + imgH + 14);
      }
      if (col === 1) py += cellH;
    }
  }

  const sanitize = (s) => (s || "").replace(/[^a-zA-ZäöüÄÖÜß0-9-]+/g, "_").replace(/^_|_$/g, "");
  const baustelle = sanitize(r.bauvorhaben) || "Bericht";
  const fname = `${baustelle}_${r.datum}.pdf`;
  try {
    doc.save(fname);
  } catch (e) {
    try {
      const url = doc.output("bloburl");
      window.open(url, "_blank");
    } catch (e2) {
      throw new Error("PDF konnte nicht ausgegeben werden");
    }
  }
}

// ============================================================
// Root
// ============================================================
export default function App() {
  const [view, setView] = useState("folders"); // folders | list | edit
  const [currentFolder, setCurrentFolder] = useState(null);
  const [index, setIndex] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const idx = await loadIndex();
      idx.sort((a, b) => b.updatedAt - a.updatedAt);
      setIndex(idx);
      setLoading(false);
    })();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  // Baustellen-Ordner aus dem Index ableiten
  const FOLDER_FALLBACK = "Ohne Baustelle";
  const folderName = (b) => (b && b.trim()) ? b.trim() : FOLDER_FALLBACK;
  const buildFolders = (idx) => {
    const map = new Map();
    idx.forEach(it => {
      const name = folderName(it.bauvorhaben);
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(it);
    });
    return Array.from(map.entries()).map(([name, list]) => {
      const sorted = list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
      return { name, count: list.length, latest: sorted[0] ? sorted[0].datum : "" };
    }).sort((a, b) => a.name.localeCompare(b.name));
  };
  const folders = buildFolders(index);
  const reportsInFolder = (name) => index
    .filter(it => folderName(it.bauvorhaben) === name)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const openFolder = (name) => { setCurrentFolder(name); setView("list"); };

  const openReport = async (id) => {
    const rep = await loadReport(id);
    if (rep) { setCurrent(rep); setView("edit"); }
  };
  // Neuer Bericht: optional mit vorausgefülltem Bauvorhaben (aus Ordner)
  const newReport = (presetBauvorhaben) => {
    const rep = emptyReport();
    if (presetBauvorhaben && presetBauvorhaben !== FOLDER_FALLBACK) rep.bauvorhaben = presetBauvorhaben;
    setCurrent(rep);
    setView("edit");
  };

  const persist = useCallback(async (rep) => {
    const toStore = { ...rep, updatedAt: Date.now() };
    await saveReport(toStore);
    const meta = { id: toStore.id, bauvorhaben: toStore.bauvorhaben, datum: toStore.datum, bauführer: toStore.bauführer, updatedAt: toStore.updatedAt };
    const idx = await loadIndex();
    const without = idx.filter(i => i.id !== meta.id);
    const next = [meta, ...without].sort((a, b) => b.updatedAt - a.updatedAt);
    await saveIndex(next);
    setIndex(next);
    return toStore;
  }, []);

  const handleSave = async () => {
    const saved = await persist(current);
    setCurrent(saved);
    setCurrentFolder(folderName(saved.bauvorhaben));
    showToast("Bericht gespeichert ✓");
  };
  const handleExport = async () => {
    // Erst speichern (offline-tauglich), dann PDF versuchen.
    const saved = await persist(current);
    setCurrent(saved);
    setCurrentFolder(folderName(saved.bauvorhaben));
    showToast("PDF wird erstellt…");
    try {
      await exportPDF(saved);
      showToast("PDF erstellt ✓");
    } catch (e) {
      console.error(e);
      showToast("PDF-Export benötigt Internet – Bericht ist gespeichert");
    }
  };
  const handleDelete = async (id) => {
    await deleteReport(id);
    const idx = (await loadIndex()).filter(i => i.id !== id);
    await saveIndex(idx); setIndex(idx);
    showToast("Bericht gelöscht");
  };
  const handleDuplicate = async (id) => {
    const rep = await loadReport(id);
    if (!rep) return;
    const copy = {
      ...rep,
      id: "rep_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      datum: new Date().toISOString().slice(0, 10),
      signature: null,      // Unterschrift nicht übernehmen
      updatedAt: Date.now(),
    };
    const saved = await persist(copy);
    setCurrent(saved);
    setView("edit");
    showToast("Als Vorlage dupliziert ✓");
  };
  const handleDeleteFolder = async (name) => {
    const toDelete = index.filter(it => folderName(it.bauvorhaben) === name);
    for (const it of toDelete) { await deleteReport(it.id); }
    const idx = (await loadIndex()).filter(it => folderName(it.bauvorhaben) !== name);
    await saveIndex(idx); setIndex(idx);
    showToast("Baustelle gelöscht");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#fbfbf4 0%,#f3f4ea 100%)", fontFamily: "'Source Sans 3', system-ui, sans-serif", color: INK }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Source+Sans+3:wght@400;600;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        input:focus, textarea:focus { outline: none; border-color:${GREEN} !important; box-shadow:0 0 0 3px rgba(91,168,58,.18); }
        button:active { transform: scale(.97); }`}</style>

      {loading ? (
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", color: "#9a9b89" }}>Lädt…</div>
      ) : view === "folders" ? (
        <FolderList folders={folders} onOpenFolder={openFolder} onNew={() => newReport()} onDeleteFolder={handleDeleteFolder} />
      ) : view === "list" ? (
        <ReportList folderName={currentFolder} items={reportsInFolder(currentFolder)} onOpen={openReport} onNew={newReport} onDelete={handleDelete} onDuplicate={handleDuplicate} onBack={() => setView("folders")} />
      ) : (
        <Editor report={current} onChange={setCurrent} onBack={() => setView(currentFolder ? "list" : "folders")} onSave={handleSave} onExport={handleExport} existingFolders={folders.map(f => f.name).filter(n => n !== FOLDER_FALLBACK)} />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: INK, color: "#fff", padding: "14px 26px", borderRadius: 30, fontSize: 16, fontWeight: 600, boxShadow: "0 6px 20px rgba(0,0,0,.25)", zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
