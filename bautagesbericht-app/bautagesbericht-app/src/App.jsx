import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, FileText, Trash2, Save, Download, ChevronLeft, Sun, CloudRain, Snowflake, Wind, ThermometerSnowflake, Check, X, Eraser, Share2, FolderOpen, Copy, ImagePlus, Camera } from "lucide-react";

// ============================================================
// Bau-Tagesbericht — Tablet-App für Zimmerei Schwaighofer GmbH
// ============================================================

const GREEN = "#5BA83A";
const DARKGREEN = "#3E7A28";
const INK = "#1f2417";

// Upload-URL für den Bautagesberichte-Flow (Power Automate → OneDrive)
// Läuft direkt in den OneDrive-Ordner des Admin-Kontos, kein Login der Vorarbeiter nötig.
const UPLOAD_URL = "https://default5f1877e2e25e45ffacad713b4d42f1.f1.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/29/workflows/bc308760667b4d68bfbc94af290453aa/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=eOi81OWVy9EpUbbLqWznVKxNURFDyPGviOp27op8XAw";

// ===== Mitarbeiter-Datenbank =====
// Format: "Nachname Vorname" + Tätigkeit
const MITARBEITER = [
  { name: "Alletsgruber Mathias", taetigkeit: "Lehrling 1. Lehrjahr" },
  { name: "Aufhammer Robert",     taetigkeit: "Facharbeiter" },
  { name: "Bachmann Philip",      taetigkeit: "Abbund" },
  { name: "Baumgartner Christoph",taetigkeit: "Lehrling 2. Lehrjahr" },
  { name: "Baumgartner Elias",    taetigkeit: "Lehrling 2. Lehrjahr" },
  { name: "Danner Mathias",       taetigkeit: "Lehrling 3. Lehrjahr" },
  { name: "Eberwein Martin",      taetigkeit: "Vorarbeiter" },
  { name: "Eberwein Christian",   taetigkeit: "LKW klein + Vorarbeiter" },
  { name: "Eder Maximilian",      taetigkeit: "Lehrling 3. Lehrjahr" },
  { name: "Eder Thomas",          taetigkeit: "Vorarbeiter" },
  { name: "Fahringer Michael",    taetigkeit: "Meister + Tech. Zeichner" },
  { name: "Grones Stefan",        taetigkeit: "Technischer Zeichner + Bauleiter" },
  { name: "Gruber Johannes",      taetigkeit: "Polier" },
  { name: "Gruber Josef",         taetigkeit: "Vorarbeiter" },
  { name: "Heger Sebastian",      taetigkeit: "Facharbeiter" },
  { name: "Heger Thomas",         taetigkeit: "Technischer Zeichner + Bauleiter" },
  { name: "Horngacher Philipp",   taetigkeit: "Vorarbeiter" },
  { name: "Huber Sander",         taetigkeit: "Lehrling 3. Lehrjahr" },
  { name: "Kania Manuel",         taetigkeit: "Facharbeiter" },
  { name: "Koller Markus",        taetigkeit: "Facharbeiter" },
  { name: "Koller Lukas",         taetigkeit: "Vorarbeiter" },
  { name: "Kronbichler Josef",    taetigkeit: "Facharbeiter" },
  { name: "Kronbichler Thomas",   taetigkeit: "Vorarbeiter" },
  { name: "Löffler Peter",        taetigkeit: "Meister + Tech. Zeichner" },
  { name: "Miller Bastian",       taetigkeit: "Facharbeiter" },
  { name: "Mittermaier Christoph",taetigkeit: "Lehrling 3. Lehrjahr" },
  { name: "Müller Jürgen",        taetigkeit: "Lehrling 2. Lehrjahr" },
  { name: "Neumann Tim",          taetigkeit: "Meister + Tech. Zeichner" },
  { name: "Osterauer Markus",     taetigkeit: "LKW groß + Vorarbeiter" },
  { name: "Pichler Markus",       taetigkeit: "Vorarbeiter" },
  { name: "Polin Reinhard",       taetigkeit: "Lagermitarbeiter" },
  { name: "Schmid Helmut",        taetigkeit: "Vorarbeiter" },
  { name: "Schächl Georg",        taetigkeit: "Facharbeiter" },
  { name: "Schreder Sebastian",   taetigkeit: "Facharbeiter" },
  { name: "Schwaiger Andreas",    taetigkeit: "Lagermitarbeiter" },
  { name: "Schwaiger Helmut",     taetigkeit: "Vorarbeiter" },
  { name: "Schwaiger Thomas",     taetigkeit: "Vorarbeiter" },
  { name: "Schwaighofer Andreas", taetigkeit: "Geschäftsführung" },
  { name: "Schwaighofer Isabella",taetigkeit: "Büromitarbeiterin" },
  { name: "Schwaighofer Julia",   taetigkeit: "Büromitarbeiterin" },
  { name: "Schwaighofer Sandra",  taetigkeit: "Büromitarbeiterin" },
  { name: "Sieberer Johannes",    taetigkeit: "Lehrling 3. Lehrjahr" },
  { name: "Sedlak Justin",        taetigkeit: "Facharbeiter" },
  { name: "Steiner Benjamin",     taetigkeit: "Vorarbeiter" },
].sort((a, b) => a.name.localeCompare(b.name, "de"));

const isLehrling     = (t) => /Lehrling/i.test(t);
const isFacharbeiter = (t) => /Facharbeiter/i.test(t) && !isLehrling(t);
// Echter Vorarbeiter: Tätigkeit enthält "Vorarbeiter" oder "Polier" (aber kein Lehrling).
// "Meister" zählt NICHT als Vorarbeiter für die Auswahllisten.
const isEchterVorarbeiter = (t) => /Vorarbeiter|Polier/i.test(t) && !isLehrling(t);
// Für Bauführer weiterhin etwas breiter (inkl. Meister, Polier, Geschäftsführung)
const isVorarbeiter  = (t) => /Vorarbeiter|Polier|Meister/i.test(t);
const isBuro         = (t) => /Büromitarbeiter/i.test(t);
const isTechZeichner = (t) => /Tech(\.|nischer)?\s*Zeichner|Bauleiter/i.test(t);
const isLager        = (t) => /Lagermitarbeiter/i.test(t);

// Bauführer-Auswahl: alle außer Lehrlinge, Büro (außer Geschäftsführung), Tech. Zeichner/Bauleiter, Lager
const BAUFUEHRER_LIST = MITARBEITER
  .filter(m => !isLehrling(m.taetigkeit) && !isBuro(m.taetigkeit) && !isTechZeichner(m.taetigkeit) && !isLager(m.taetigkeit))
  .map(m => m.name);

// Vorarbeiter-Feld: NUR echte Vorarbeiter (Vorarbeiter oder Polier, ohne Meister, ohne Lehrling)
const VORARBEITER_LIST = MITARBEITER
  .filter(m => isEchterVorarbeiter(m.taetigkeit))
  .map(m => m.name);

// Facharbeiter-Feld: Facharbeiter + alle echten Vorarbeiter (zur gemeinsamen Auswahl)
const FACHARBEITER_LIST = MITARBEITER
  .filter(m => (isFacharbeiter(m.taetigkeit) || isEchterVorarbeiter(m.taetigkeit)) && !isLehrling(m.taetigkeit))
  .map(m => m.name);

// Lehrlings-Feld: alle Lehrlinge
const LEHRLINGE_LIST = MITARBEITER
  .filter(m => isLehrling(m.taetigkeit))
  .map(m => m.name);

// LKW-Optionen (feste Auswahl)
const LKW_OPTIONS = ["LKW 31 Tonnen", "LKW 24 Tonnen"];

// Techniker-Auswahl (feste Reihenfolge alphabetisch)
const TECHNIKER_LIST = [
  "Fahringer Michael",
  "Grones Stefan",
  "Heger Thomas",
  "Löffler Peter",
  "Neumann Tim",
  "Schwaighofer Andreas",
];

// Fahrzeuge/Hebegeräte
const FAHRZEUGE_LIST = [
  "LKW 31 Tonnen (Scania)",
  "LKW 24 Tonnen (MAN)",
  "Traktor STEYR",
  "Traktor STEYR (Mulde)",
  "Traktor STEYR (Auwärter)",
  "Traktor STEYR (Hackenlift)",
  "Stapler",
  "Manitou",
  "Arbeitsbühne",
];

// Mengeneinheiten
const EINHEIT_LIST = ["lfm", "m²", "m³", "kg", "Tonnen", "Stk.", "Pkg.", "EH", "Rollen"];

const LOGO = "data:image/jpeg;base64,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";

const emptyReport = () => ({
  id: "rep_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
  datum: new Date().toISOString().slice(0, 10),
  bauvorhaben: "",
  techniker: "",
  bauführer: "",
  witterung: { sonne: false, regen: false, frost: false, wind: false, schnee: false },
  temperatur: "",
  arbeiter: {
    vorarbeiter:  { n: "", std: "", namen: "", stundenPro: {} },
    facharbeiter: { n: "", std: "", namen: "", stundenPro: {} },
    lehrling:     { n: "", std: "", namen: "", stundenPro: {} },
  },
  fahrzeuge: [],   // [{ id, name, std }]
  leistungsergebnisse: [""],   // Liste von Punkten
  material: [],                // [{ id, bezeichnung, menge, einheit }]
  regieLeistungen: [],         // [{ id, bezeichnung, personen, stunden }]
  regieMaterial: [],           // [{ id, bezeichnung, menge, einheit }]
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
function countNamen(s) {
  return (s || "").split(",").map(x => x.trim()).filter(Boolean).length;
}
function namesFromString(s) {
  return (s || "").split(",").map(x => x.trim()).filter(Boolean);
}
// Stunden pro Mitarbeiter: nutzt Einzelwerte aus a.stundenPro[name], Fallback auf a.std
function hoursForName(a, name) {
  if (a && a.stundenPro && a.stundenPro[name] !== undefined && a.stundenPro[name] !== "") {
    return parseNum(a.stundenPro[name]);
  }
  return parseNum(a && a.std);
}
function categoryTotal(a) {
  if (!a) return 0;
  const names = namesFromString(a.namen);
  if (names.length === 0) {
    // Fallback: alte Berichte ohne Namen, nutze Anzahl × Stunden
    const std = parseNum(a.std);
    const n = parseNum(a.n);
    return std * (n > 0 ? n : 1);
  }
  return names.reduce((s, n) => s + hoursForName(a, n), 0);
}
function totalHours(arbeiter) {
  return Object.entries(arbeiter).reduce((sum, [key, a]) => {
    if (key === "kraftfahrer") return sum;
    return sum + categoryTotal(a);
  }, 0);
}
function fmtHours(h) {
  // 2 Nachkommastellen, OHNE Rundung (Hundertstel werden abgeschnitten)
  if (h == null || isNaN(h)) return "0,00";
  const sign = h < 0 ? "-" : "";
  const abs = Math.abs(h);
  const truncated = Math.floor(abs * 100) / 100;
  return sign + truncated.toFixed(2).replace(".", ",");
}

function Logo({ small }) {
  return (
    <img src={LOGO} alt="Zimmerei Schwaighofer GmbH"
      style={{ height: small ? 44 : 70, width: "auto", display: "block", borderRadius: 6 }} />
  );
}

// ---------- persistent storage helpers ----------
const INDEX_KEY = "btb:index";

// ---------- localStorage-Wrapper mit derselben API wie window.storage ----------
// Echte Browser-API ist localStorage; wir verpacken sie in dieselbe async-Signatur,
// damit der restliche Code unverändert läuft.
const storage = {
  async get(key) {
    try {
      const v = window.localStorage.getItem(key);
      return v === null ? null : { value: v };
    } catch (e) { console.error("storage.get:", e); return null; }
  },
  async set(key, value) {
    // wirft bei Quota-Überschreitung, das ist gewollt (oben gefangen)
    window.localStorage.setItem(key, value);
    return true;
  },
  async delete(key) {
    try { window.localStorage.removeItem(key); return true; }
    catch (e) { console.error("storage.delete:", e); return false; }
  },
};

// ---------- IndexedDB für Original-Fotos (umgeht localStorage 5-MB-Limit) ----------
const IDB_NAME = "btb-originals";
const IDB_STORE = "fotos";

function idbOpen() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("IndexedDB nicht verfügbar"));
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value) {
  try {
    const db = await idbOpen();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch (e) { console.error("idbSet:", e); return false; }
}
async function idbGet(key) {
  try {
    const db = await idbOpen();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => { db.close(); resolve(req.result || null); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  } catch (e) { console.error("idbGet:", e); return null; }
}
async function idbDelete(key) {
  try {
    const db = await idbOpen();
    return await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    });
  } catch (e) { console.error("idbDelete:", e); return false; }
}

async function loadIndex() {
  try {
    const res = await storage.get(INDEX_KEY);
    return res ? JSON.parse(res.value) : [];
  } catch {
    return [];
  }
}
async function saveIndex(idx) {
  try { await storage.set(INDEX_KEY, JSON.stringify(idx)); } catch (e) { console.error(e); }
}
async function loadReport(id) {
  let res;
  try {
    res = await storage.get("btb:rep:" + id);
  } catch (e) {
    console.error("loadReport storage.get failed:", e);
    return null;
  }
  if (!res) return null;
  let rep;
  try {
    rep = JSON.parse(res.value);
  } catch (e) {
    console.error("loadReport JSON.parse failed:", e);
    return null;
  }
  try {
    // Migration: leistungsergebnisse von String -> Array
    if (!Array.isArray(rep.leistungsergebnisse)) {
      const str = (rep.leistungsergebnisse || "").trim();
      rep.leistungsergebnisse = str ? str.split("\n").map(s => s.trim()).filter(Boolean) : [""];
      if (rep.leistungsergebnisse.length === 0) rep.leistungsergebnisse = [""];
    }
    // Regie-Leistungen: String-Liste -> Objekt-Liste
    if (!Array.isArray(rep.regieLeistungen)) {
      rep.regieLeistungen = [];
    } else if (rep.regieLeistungen.length > 0 && typeof rep.regieLeistungen[0] === "string") {
      rep.regieLeistungen = rep.regieLeistungen
        .filter(s => s && s.trim())
        .map(s => ({ id: "regie_" + Math.random().toString(36).slice(2, 8), bezeichnung: s, personen: "", stunden: "" }));
    }
    if (!Array.isArray(rep.fotos)) rep.fotos = [];
    if (rep.techniker === undefined) rep.techniker = "";
    // Material/Regie-Material: String -> Liste
    const migrateMaterial = (val) => {
      if (Array.isArray(val)) return val;
      const s = (val || "").trim();
      if (!s) return [];
      return [{ id: "mat_" + Math.random().toString(36).slice(2, 8), bezeichnung: s, menge: "", einheit: "" }];
    };
    rep.material = migrateMaterial(rep.material);
    rep.regieMaterial = migrateMaterial(rep.regieMaterial);
    // Fahrzeuge: aus altem kraftfahrer-Eintrag übernehmen wenn vorhanden
    if (!Array.isArray(rep.fahrzeuge)) {
      const alt = rep.arbeiter?.kraftfahrer;
      if (alt && (alt.namen || alt.std)) {
        rep.fahrzeuge = [{ id: "fz_" + Math.random().toString(36).slice(2, 8), name: alt.namen || "", std: alt.std || "" }];
      } else {
        rep.fahrzeuge = [];
      }
    }
    // kraftfahrer-Kategorie aus arbeiter entfernen (wird zu fahrzeuge)
    if (rep.arbeiter && rep.arbeiter.kraftfahrer) {
      const { kraftfahrer, ...rest } = rep.arbeiter;
      rep.arbeiter = rest;
    }
    // Migration: namen-Feld und stundenPro in Arbeiter-Kategorien ergänzen
    if (rep.arbeiter) {
      Object.keys(rep.arbeiter).forEach(k => {
        const a = rep.arbeiter[k];
        if (a && a.namen === undefined) a.namen = "";
        if (a && (a.stundenPro === undefined || a.stundenPro === null || typeof a.stundenPro !== "object" || Array.isArray(a.stundenPro))) {
          a.stundenPro = {};
        }
      });
    }
    // Original-Fotos und ggf. ausgelagerte Vorschauen aus IDB nachladen
    if (Array.isArray(rep.fotos) && rep.fotos.length > 0) {
      for (const f of rep.fotos) {
        if (f && f.hasOriginal && !f.originalUrl) {
          try {
            const orig = await idbGet("orig:" + rep.id + ":" + f.id);
            if (orig) f.originalUrl = orig;
          } catch (e) { console.error("idbGet orig:", e); }
        }
        if (f && f.hasPreview && !f.dataUrl) {
          try {
            const prev = await idbGet("preview:" + rep.id + ":" + f.id);
            if (prev) f.dataUrl = prev;
          } catch (e) { console.error("idbGet preview:", e); }
        }
      }
    }
    return rep;
  } catch (e) {
    console.error("loadReport migration failed:", e);
    return rep; // Trotzdem zurückgeben, damit der Bericht öffnet
  }
}
async function saveReport(rep) {
  // Original-Fotos in IndexedDB auslagern, damit der Bericht klein bleibt.
  // Im Bericht-JSON nur die kleine Vorschau (dataUrl) + Metadaten.
  const fotosSchlank = [];
  if (Array.isArray(rep.fotos)) {
    for (const f of rep.fotos) {
      if (!f) continue;
      const copy = { ...f };
      if (copy.originalUrl) {
        try {
          await idbSet("orig:" + rep.id + ":" + copy.id, copy.originalUrl);
          copy.hasOriginal = true;
        } catch (e) { console.error("idbSet original failed", e); }
        delete copy.originalUrl;
      }
      fotosSchlank.push(copy);
    }
  }
  const lean = { ...rep, fotos: fotosSchlank };

  // Versuch 1: ganz normal in localStorage
  try {
    await storage.set("btb:rep:" + rep.id, JSON.stringify(lean));
    return { ok: true };
  } catch (e1) {
    console.error("saveReport try1 failed:", e1);
    // Versuch 2: Wenn es nach Quota aussieht, auch die Foto-VORSCHAUEN in IDB auslagern.
    const looksLikeQuota = e1 && (
      e1.name === "QuotaExceededError" ||
      (typeof e1.message === "string" && /quota|exceed|storage/i.test(e1.message))
    );
    if (looksLikeQuota && fotosSchlank.length > 0) {
      try {
        const fotosUltraLean = [];
        for (const f of fotosSchlank) {
          const copy = { ...f };
          if (copy.dataUrl) {
            try {
              await idbSet("preview:" + rep.id + ":" + copy.id, copy.dataUrl);
              copy.hasPreview = true;
            } catch (e) { console.error("idbSet preview failed", e); }
            delete copy.dataUrl;
          }
          fotosUltraLean.push(copy);
        }
        const ultraLean = { ...lean, fotos: fotosUltraLean };
        await storage.set("btb:rep:" + rep.id, JSON.stringify(ultraLean));
        return { ok: true };
      } catch (e2) {
        console.error("saveReport try2 failed:", e2);
        return { ok: false, error: "quota", detail: e2 && e2.message };
      }
    }
    return {
      ok: false,
      error: looksLikeQuota ? "quota" : "other",
      detail: e1 && (e1.message || e1.name) || String(e1),
    };
  }
}
async function deleteReport(id) {
  try { await storage.delete("btb:rep:" + id); } catch (e) { console.error(e); }
  // zugehörige Originale aus IDB aufräumen
  try {
    const db = await idbOpen();
    await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const req = store.openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (c) {
          const k = String(c.key);
          if (k.startsWith("orig:" + id + ":") || k.startsWith("preview:" + id + ":")) c.delete();
          c.continue();
        }
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); resolve(); };
    });
  } catch (e) { console.error("cleanup originals:", e); }
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
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
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
    // Vor dem Export auf weißen Hintergrund kopieren, damit die Unterschrift
    // im PDF deutlich sichtbar ist (transparente PNGs wirken oft blass).
    const src = canvasRef.current;
    const out = document.createElement("canvas");
    out.width = src.width;
    out.height = src.height;
    const octx = out.getContext("2d");
    octx.fillStyle = "#ffffff";
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(src, 0, 0);
    onChange(out.toDataURL("image/png"));
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

// Strukturierte Materialliste: Bezeichnung, Menge, Einheit
function MaterialList({ items, onChange, placeholder }) {
  const list = Array.isArray(items) ? items : [];
  const newItem = () => ({ id: "mat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), bezeichnung: "", menge: "", einheit: "" });
  const update = (id, field, val) => onChange(list.map(it => it.id === id ? { ...it, [field]: val } : it));
  const add = () => onChange([...list, newItem()]);
  const remove = (id) => onChange(list.filter(it => it.id !== id));

  return (
    <div>
      {list.length === 0 && (
        <p style={{ fontSize: 14, color: "#9a9b89", margin: "0 0 10px 2px", fontStyle: "italic" }}>
          Noch kein Material erfasst.
        </p>
      )}
      {list.map((it) => (
        <div key={it.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "stretch", flexWrap: "wrap" }}>
          <input
            value={it.bezeichnung}
            onChange={e => update(it.id, "bezeichnung", e.target.value)}
            placeholder={placeholder || "Bezeichnung…"}
            style={{ ...inputStyle, flex: "2 1 200px", minWidth: 180 }}
          />
          <input
            inputMode="decimal"
            value={it.menge}
            onChange={e => update(it.id, "menge", e.target.value)}
            placeholder="Menge"
            style={{ ...inputStyle, flex: "0 0 100px", textAlign: "center" }}
          />
          <select
            value={it.einheit || ""}
            onChange={e => update(it.id, "einheit", e.target.value)}
            style={{ ...inputStyle, flex: "0 0 110px", appearance: "auto", WebkitAppearance: "menulist", paddingRight: 14 }}>
            <option value="">Einheit…</option>
            {EINHEIT_LIST.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button onClick={() => remove(it.id)} style={{ ...btnGhost, padding: 12, borderColor: "#e0c4c4", color: "#b04a4a", flexShrink: 0 }} title="Eintrag entfernen">
            <X size={20} />
          </button>
        </div>
      ))}
      <button onClick={add} style={{ ...btnGhost, borderColor: GREEN, color: DARKGREEN, marginTop: 2 }}>
        <Plus size={18} /> Material hinzufügen
      </button>
    </div>
  );
}

// Fahrzeug-/Hebegerät-Liste: Auswahl + Stunden
function FahrzeugList({ items, onChange }) {
  const list = Array.isArray(items) ? items : [];
  const newItem = () => ({ id: "fz_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), name: "", std: "" });
  const update = (id, field, val) => onChange(list.map(it => it.id === id ? { ...it, [field]: val } : it));
  const add = () => onChange([...list, newItem()]);
  const remove = (id) => onChange(list.filter(it => it.id !== id));

  // Summe der Stunden
  const totalStd = list.reduce((s, it) => {
    const n = parseFloat(String(it.std || "").replace(",", "."));
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const fmt = fmtHours;

  return (
    <div>
      {list.length === 0 && (
        <p style={{ fontSize: 14, color: "#9a9b89", margin: "0 0 10px 2px", fontStyle: "italic" }}>
          Noch kein Fahrzeug/Hebegerät erfasst.
        </p>
      )}
      {list.map((it) => (
        <div key={it.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "stretch", flexWrap: "wrap" }}>
          <select
            value={it.name || ""}
            onChange={e => update(it.id, "name", e.target.value)}
            style={{ ...inputStyle, flex: "2 1 240px", minWidth: 220, appearance: "auto", WebkitAppearance: "menulist", paddingRight: 14 }}>
            <option value="">Fahrzeug/Hebegerät wählen…</option>
            {FAHRZEUGE_LIST.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input
            inputMode="decimal"
            value={it.std}
            onChange={e => update(it.id, "std", e.target.value)}
            placeholder="Stunden"
            style={{ ...inputStyle, flex: "0 0 110px", textAlign: "center" }}
          />
          <button onClick={() => remove(it.id)} style={{ ...btnGhost, padding: 12, borderColor: "#e0c4c4", color: "#b04a4a", flexShrink: 0 }} title="Eintrag entfernen">
            <X size={20} />
          </button>
        </div>
      ))}
      <button onClick={add} style={{ ...btnGhost, borderColor: GREEN, color: DARKGREEN, marginTop: 2 }}>
        <Plus size={18} /> Fahrzeug/Hebegerät hinzufügen
      </button>
      {list.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#fff4e6", border: "2px solid #d99a3f", borderRadius: 12 }}>
          <span style={{ fontWeight: 800, color: "#8a5a1c", fontSize: 15 }}>Gerätestunden gesamt</span>
          <span style={{ fontWeight: 800, color: "#8a5a1c", fontSize: 18 }}>{fmt(totalStd)} Std.</span>
        </div>
      )}
    </div>
  );
}

// Regie-Leistungen: Bezeichnung + Personen + Stunden mit Gesamtsumme
function RegieLeistungList({ items, onChange }) {
  const list = Array.isArray(items) ? items : [];
  const newItem = () => ({ id: "regie_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6), bezeichnung: "", personen: "", stunden: "" });
  const update = (id, field, val) => onChange(list.map(it => it.id === id ? { ...it, [field]: val } : it));
  const add = () => onChange([...list, newItem()]);
  const remove = (id) => onChange(list.filter(it => it.id !== id));

  const parse = (v) => { const n = parseFloat(String(v || "").replace(",", ".")); return isNaN(n) ? 0 : n; };
  // Gesamtstunden = Personen × Stunden je Eintrag
  const totalStd = list.reduce((s, it) => {
    const std = parse(it.stunden); if (!std) return s;
    const p = parse(it.personen); return s + std * (p > 0 ? p : 1);
  }, 0);
  const fmt = fmtHours;

  return (
    <div>
      {list.length === 0 && (
        <p style={{ fontSize: 14, color: "#9a9b89", margin: "0 0 10px 2px", fontStyle: "italic" }}>
          Noch keine Regie-Leistung erfasst.
        </p>
      )}
      {list.map((it) => (
        <div key={it.id} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "stretch", flexWrap: "wrap" }}>
          <input
            value={it.bezeichnung}
            onChange={e => update(it.id, "bezeichnung", e.target.value)}
            placeholder="Bezeichnung der Regie-Leistung…"
            style={{ ...inputStyle, flex: "2 1 240px", minWidth: 200 }}
          />
          <input
            inputMode="numeric"
            value={it.personen}
            onChange={e => update(it.id, "personen", e.target.value)}
            placeholder="Personen"
            style={{ ...inputStyle, flex: "0 0 90px", textAlign: "center" }}
            title="Anzahl Personen"
          />
          <input
            inputMode="decimal"
            value={it.stunden}
            onChange={e => update(it.id, "stunden", e.target.value)}
            placeholder="Std."
            style={{ ...inputStyle, flex: "0 0 90px", textAlign: "center" }}
            title="Stunden je Person"
          />
          <button onClick={() => remove(it.id)} style={{ ...btnGhost, padding: 12, borderColor: "#e0c4c4", color: "#b04a4a", flexShrink: 0 }} title="Eintrag entfernen">
            <X size={20} />
          </button>
        </div>
      ))}
      <button onClick={add} style={{ ...btnGhost, borderColor: GREEN, color: DARKGREEN, marginTop: 2 }}>
        <Plus size={18} /> Regie-Leistung hinzufügen
      </button>
      {list.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#eef7e6", border: "2px solid " + GREEN, borderRadius: 12 }}>
          <span style={{ fontWeight: 800, color: DARKGREEN, fontSize: 15 }}>Regie-Stunden gesamt (zusätzlich)</span>
          <span style={{ fontWeight: 800, color: DARKGREEN, fontSize: 18 }}>{fmt(totalStd)} Std.</span>
        </div>
      )}
      <p style={{ fontSize: 12, color: "#9a9b89", margin: "8px 2px 0" }}>
        Berechnung: Personen × Stunden je Eintrag. Diese Stunden kommen zusätzlich zur Arbeitsleistung oben.
      </p>
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

// Liest das Original als DataURL ein – wird beim Export in voller Qualität exportiert.
async function fileToOriginalDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
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
        const [dataUrl, originalUrl] = await Promise.all([
          fileToCompressedDataURL(f),
          fileToOriginalDataURL(f),
        ]);
        additions.push({
          id: "foto_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
          dataUrl,           // klein, für Vorschau + PDF
          originalUrl,       // Original, für ZIP-Export
          originalName: f.name || "foto.jpg",
          originalType: f.type || "image/jpeg",
          kommentar: "",
        });
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


// Mehrfach-Auswahl als „Pills" – Mitarbeiter werden angetippt und an-/abgewählt.
// Liefert einen kommagetrennten String an onChange (kompatibel mit Datenmodell).
function MultiSelectPills({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selected = (value || "").split(",").map(s => s.trim()).filter(Boolean);
  const isSelected = (name) => selected.includes(name);
  const toggle = (name) => {
    const next = isSelected(name) ? selected.filter(n => n !== name) : [...selected, name];
    next.sort((a, b) => a.localeCompare(b, "de"));
    onChange(next.join(", "));
  };
  const clear = () => onChange("");

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("touchstart", onDocPointer);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("touchstart", onDocPointer);
    };
  }, [open]);

  return (
    <div ref={wrapRef}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8, minHeight: 30 }}>
        {selected.length === 0 ? (
          <span style={{ color: "#9a9b89", fontSize: 14, fontStyle: "italic", padding: "6px 0" }}>
            Noch niemand ausgewählt
          </span>
        ) : (
          selected.map(n => (
            <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 12px", borderRadius: 999, background: "#eef7e6", border: "1px solid " + GREEN, color: DARKGREEN, fontSize: 14, fontWeight: 600 }}>
              {n}
              <button onClick={() => toggle(n)} title="Entfernen"
                style={{ border: "none", background: "rgba(0,0,0,.08)", color: DARKGREEN, borderRadius: 999, width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setOpen(o => !o)}
          style={{ ...btnGhost, borderColor: GREEN, color: DARKGREEN }}>
          <Plus size={18} /> {label || "Auswählen"}
        </button>
        {selected.length > 0 && (
          <button onClick={clear} style={{ ...btnGhost, color: "#888" }}>
            Alle entfernen
          </button>
        )}
      </div>
      {open && (
        <div style={{ marginTop: 10, border: "2px solid #c9cabb", borderRadius: 12, background: "#fff", maxHeight: 280, overflowY: "auto" }}>
          {options.length === 0 ? (
            <div style={{ padding: 14, color: "#9a9b89", fontSize: 14 }}>Keine Einträge verfügbar.</div>
          ) : (
            options.map((opt, i) => {
              const sel = isSelected(opt);
              return (
                <button key={opt} onClick={() => toggle(opt)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                    textAlign: "left", padding: "12px 14px", border: "none",
                    background: sel ? "#eef7e6" : "#fff", cursor: "pointer", fontSize: 15,
                    borderTop: i === 0 ? "none" : "1px solid #f0f1e6",
                    color: INK, fontFamily: "inherit", fontWeight: sel ? 700 : 500,
                  }}>
                  <span>{opt}</span>
                  {sel ? <Check size={18} color={GREEN} /> : <span style={{ width: 18 }} />}
                </button>
              );
            })
          )}
          <div style={{ padding: 8, borderTop: "1px solid #e3e3d4", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setOpen(false)} style={{ ...btnGhost, padding: "8px 14px" }}>
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Einfache Einzel-Auswahl als Dropdown (für Bauführer, LKW)
function NativeSelect({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ""} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, appearance: "auto", WebkitAppearance: "menulist", paddingRight: 14 }}>
      <option value="">{placeholder || "Bitte wählen…"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Bulk-Stunden-Setzer: Eingabe + Knopf, der alle Stunden einer Kategorie überschreibt
function BulkStundenSetzer({ onSet }) {
  const [val, setVal] = useState("");
  const apply = () => { if (val !== "") onSet(val); };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", background: "#f3f7ee", border: "1px dashed " + GREEN, borderRadius: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, color: DARKGREEN, fontWeight: 700 }}>Alle gleich:</span>
      <input inputMode="decimal" value={val} onChange={e => setVal(e.target.value)} placeholder="z. B. 8"
        style={{ ...inputStyle, padding: "8px 10px", textAlign: "center", fontSize: 15, width: 80, flex: "0 0 auto" }} />
      <span style={{ fontSize: 13, color: "#6b6c5c" }}>Std.</span>
      <button onClick={apply}
        style={{ ...btnGhost, padding: "8px 14px", borderColor: GREEN, color: DARKGREEN, fontSize: 14 }}>
        Auf alle setzen
      </button>
    </div>
  );
}

// Temperatur-Schieberegler von -20 bis +40 °C mit großer Anzeige
function TempSlider({ value, onChange, min = -20, max = 40 }) {
  const parsed = parseInt((value || "").replace("+", ""), 10);
  const num = isNaN(parsed) ? 10 : parsed;
  const display = num > 0 ? "+" + num : String(num);
  const t = (num - min) / (max - min);
  const hue = Math.round(220 - t * 220);
  const color = `hsl(${hue}, 75%, 45%)`;
  const handleChange = (raw) => {
    const n = parseInt(raw, 10);
    onChange(n > 0 ? "+" + n : String(n));
  };
  const fillPercent = t * 100;
  const trackBg = `linear-gradient(to right, ${color} 0%, ${color} ${fillPercent}%, #d6d7c8 ${fillPercent}%, #d6d7c8 100%)`;
  return (
    <div style={{ padding: "8px 4px 4px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 14 }}>
        <span style={{ fontSize: 48, fontWeight: 800, color, lineHeight: 1, fontFamily: "Oswald, sans-serif" }}>{display}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: "#6b6c5c" }}>°C</span>
      </div>
      <div style={{ position: "relative", padding: "10px 0" }}>
        <input type="range" min={min} max={max} step={1} value={num}
          onChange={(e) => handleChange(e.target.value)}
          className="temp-slider"
          style={{ width: "100%", margin: 0, cursor: "pointer", display: "block", background: trackBg }} />
      </div>
      <style>{`
        input.temp-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          border-radius: 999px;
          border: 1px solid #b8b9a8;
          outline: none;
        }
        input.temp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${color};
          box-shadow: 0 2px 6px rgba(0,0,0,.25);
          cursor: grab;
        }
        input.temp-slider::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.1); }
        input.temp-slider::-moz-range-thumb {
          width: 32px; height: 32px; border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${color};
          box-shadow: 0 2px 6px rgba(0,0,0,.25);
          cursor: grab;
        }
        input.temp-slider::-moz-range-track { background: transparent; }
      `}</style>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b6c5c", marginTop: 8, padding: "0 4px", fontWeight: 600 }}>
        <span>{min} °C</span>
        <span>0 °C</span>
        <span>+{max} °C</span>
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

function Editor({ report, onChange, onBack, onSave, onExport, onShare, existingFolders }) {
  const r = report;
  const set = (patch) => onChange({ ...r, ...patch });
  const setArb = (key, sub, val) => set({ arbeiter: { ...r.arbeiter, [key]: { ...r.arbeiter[key], [sub]: val } } });
  const toggleW = (k) => set({ witterung: { ...r.witterung, [k]: !r.witterung[k] } });

  const arbRows = [
    ["vorarbeiter",  "Vorarbeiter",   VORARBEITER_LIST,  "multi"],
    ["facharbeiter", "Facharbeiter",  FACHARBEITER_LIST, "multi"],
    ["lehrling",     "Lehrlinge",     LEHRLINGE_LIST,    "multi"],
  ];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fbfbf4", borderBottom: "2px solid #e3e3d4", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onBack} style={btnGhost}><ChevronLeft size={20} /> Zurück</button>
        <div style={{ flex: 1 }} />
        <button onClick={onSave} style={{ ...btnGhost, background: GREEN, color: "#fff", borderColor: GREEN, padding: "12px 22px", fontSize: 16 }}>
          <Save size={18} /> Speichern
        </button>
        <button onClick={onShare} style={{ ...btnGhost, background: "#0078d4", color: "#fff", borderColor: "#0078d4", padding: "12px 18px", fontSize: 16 }}
          title="Bericht über das Teilen-Menü an OneDrive senden">
          <Share2 size={18} /> An OneDrive
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 200px" }}>
            <Field label="Datum">
              <TextInput type="date" value={r.datum} onChange={e => set({ datum: e.target.value })} style={{ fontSize: 16 }} />
            </Field>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <Field label="Temperatur">
              <TempSlider value={r.temperatur} onChange={(v) => set({ temperatur: v })} />
            </Field>
          </div>
        </div>
        <Field label="Bauvorhaben"><BauvorhabenAutocomplete value={r.bauvorhaben} onChange={(v) => set({ bauvorhaben: v })} suggestions={existingFolders} /></Field>
        <Field label="Zuständiger Techniker">
          <NativeSelect value={r.techniker} onChange={(v) => set({ techniker: v })}
            options={TECHNIKER_LIST}
            placeholder="Techniker wählen…" />
        </Field>
        <Field label="Verantwortlicher Bauführer">
          <NativeSelect value={r.bauführer} onChange={(v) => {
              // Bauführer setzen; wenn der Vorarbeiter-Bereich noch leer ist,
              // den Bauführer dort automatisch eintragen (Liste muss ihn kennen)
              const patch = { bauführer: v };
              const vor = r.arbeiter?.vorarbeiter?.namen || "";
              if (v && !vor.trim()) {
                patch.arbeiter = {
                  ...r.arbeiter,
                  vorarbeiter: { ...(r.arbeiter?.vorarbeiter || { n: "", std: "", namen: "" }), namen: v },
                };
              }
              onChange({ ...r, ...patch });
            }}
            options={BAUFUEHRER_LIST}
            placeholder="Bauführer wählen…" />
        </Field>

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
          <div style={{ display: "grid", gap: 14 }}>
            {arbRows.map(([key, lbl, opts, mode]) => {
              const a = r.arbeiter[key] || { n: "", std: "", namen: "", stundenPro: {} };
              const selectedNames = (a.namen || "").split(",").map(s => s.trim()).filter(Boolean);
              const autoCount = selectedNames.length;
              const catSum = categoryTotal(a);
              const setStundenPro = (name, val) => {
                const newSP = { ...(a.stundenPro || {}), [name]: val };
                set({ arbeiter: { ...r.arbeiter, [key]: { ...a, stundenPro: newSP } } });
              };
              const setAllStunden = (val) => {
                const newSP = {};
                selectedNames.forEach(n => { newSP[n] = val; });
                set({ arbeiter: { ...r.arbeiter, [key]: { ...a, stundenPro: newSP, std: val } } });
              };
              return (
                <div key={key} style={{ border: "2px solid #c9cabb", borderRadius: 14, background: "#fff", padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: DARKGREEN }}>{lbl}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14, color: "#6b6c5c" }}>
                      <span>Anzahl: <strong style={{ color: INK, fontSize: 16 }}>{autoCount || "—"}</strong></span>
                      <span>Summe: <strong style={{ color: DARKGREEN, fontSize: 16 }}>{fmtHours(catSum)} Std.</strong></span>
                    </div>
                  </div>
                  {mode === "multi" ? (
                    <MultiSelectPills
                      value={a.namen}
                      onChange={(v) => { setArb(key, "namen", v); }}
                      options={opts}
                      label={"Aus Liste wählen"}
                    />
                  ) : (
                    <NativeSelect
                      value={a.namen}
                      onChange={(v) => setArb(key, "namen", v)}
                      options={opts}
                      placeholder="LKW wählen…"
                    />
                  )}
                  {/* Stunden pro Person, Bulk-Knopf darunter */}
                  {selectedNames.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "grid", gap: 8 }}>
                        {selectedNames.map(n => (
                          <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fbfbf4", borderRadius: 10, border: "1px solid #e3e3d4" }}>
                            <span style={{ flex: 1, fontSize: 15, color: INK, fontWeight: 500 }}>{n}</span>
                            <input
                              inputMode="decimal"
                              value={(a.stundenPro && a.stundenPro[n] !== undefined) ? a.stundenPro[n] : (a.std || "")}
                              onChange={e => setStundenPro(n, e.target.value)}
                              placeholder="Std."
                              style={{ ...inputStyle, padding: "8px 10px", textAlign: "center", fontSize: 15, width: 80, flex: "0 0 auto" }}
                            />
                            <span style={{ fontSize: 13, color: "#9a9b89", width: 26 }}>Std.</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <BulkStundenSetzer onSet={setAllStunden} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 14, background: "#eef7e6", padding: "14px 18px", border: "2px solid " + GREEN }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: DARKGREEN }}>Arbeitsleistung ohne Gerät</div>
              <div style={{ fontWeight: 800, fontSize: 20, color: DARKGREEN }}>{fmtHours(totalHours(r.arbeiter))} Std.</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#9a9b89", margin: "8px 2px 0" }}>
            Stunden können pro Person eingetragen werden. Mit „Alle setzen" lassen sich alle Stunden einer Kategorie auf denselben Wert stellen.
          </p>
        </Field>

        <Field label="Fahrzeuge / Hebegeräte">
          <FahrzeugList items={r.fahrzeuge} onChange={(v) => set({ fahrzeuge: v })} />
        </Field>

        <Field label="Leistungsergebnisse"><BulletListInput items={r.leistungsergebnisse} onChange={(v) => set({ leistungsergebnisse: v })} placeholder="Durchgeführte Arbeit eintragen…" /></Field>
        <Field label="Material">
          <MaterialList items={r.material} onChange={(v) => set({ material: v })} placeholder="Bezeichnung des Materials…" />
        </Field>
        <Field label="Regie-Leistungen"><RegieLeistungList items={r.regieLeistungen} onChange={(v) => set({ regieLeistungen: v })} /></Field>
        <Field label="Regie-Material">
          <MaterialList items={r.regieMaterial} onChange={(v) => set({ regieMaterial: v })} placeholder="Bezeichnung des Regie-Materials…" />
        </Field>

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
function FolderList({ folders, onOpenFolder, onNew, onDeleteFolder, onOpenAll }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 18px 120px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 38, color: INK, margin: 0, textTransform: "uppercase", letterSpacing: 1.5, lineHeight: 1 }}>Baustellen</h1>
          <div style={{ marginTop: 10 }}>
            <a href="https://zimmerei-schwaighofer.at/" target="_blank" rel="noopener noreferrer"
               title="Zur Website der Zimmerei Schwaighofer GmbH"
               style={{ display: "inline-block", textDecoration: "none" }}>
              <Logo small />
            </a>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onOpenAll} style={{ ...btnGhost, padding: "14px 18px", fontSize: 15, borderColor: DARKGREEN, color: DARKGREEN }} title="Alle Berichte aller Baustellen anzeigen (Admin-Übersicht)">
            <FileText size={20} /> Alle Berichte
          </button>
          <button onClick={onNew} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 24px", borderRadius: 14, border: "none", background: GREEN, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(91,168,58,.35)" }}>
            <Plus size={24} /> Neuer Bericht
          </button>
        </div>
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
// Kleine Status-Anzeige für den Upload-Zustand eines Berichts
function UploadBadge({ meta }) {
  const uploaded = meta && meta.uploaded;
  const hasError = meta && meta.uploadError;
  let bg, color, label;
  if (uploaded) { bg = "#eef7e6"; color = DARKGREEN; label = "Hochgeladen ✓"; }
  else if (hasError) { bg = "#fce7e7"; color = "#a1372f"; label = "Upload-Fehler"; }
  else { bg = "#f0f0e6"; color = "#6b6c5c"; label = "Nicht hochgeladen"; }
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      background: bg, color: color, fontSize: 12, fontWeight: 700,
      whiteSpace: "nowrap", marginLeft: 8,
    }} title={hasError ? meta.uploadError : ""}>
      {label}
    </span>
  );
}
function formatUploadedAt(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n) => n < 10 ? "0" + n : "" + n;
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AllReports({ items, onOpen, onDelete, onBack, onRetry }) {
  const [q, setQ] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // all | uploaded | pending | error
  const norm = (s) => (s || "").toString().toLowerCase();
  const filtered = items.filter(it => {
    if (filterMode === "uploaded" && !it.uploaded) return false;
    if (filterMode === "error" && !it.uploadError) return false;
    if (filterMode === "pending" && (it.uploaded || it.uploadError)) return false;
    if (!q.trim()) return true;
    const hay = norm(it.bauvorhaben) + " " + norm(it.bauführer) + " " + norm(it.datum);
    return hay.includes(norm(q));
  });
  // Statistik für Anzeige oben
  const stats = items.reduce((s, it) => {
    if (it.uploaded) s.uploaded++;
    else if (it.uploadError) s.error++;
    else s.pending++;
    return s;
  }, { uploaded: 0, error: 0, pending: 0 });
  const filterBtn = (mode, label, count, bg, col) => (
    <button onClick={() => setFilterMode(mode)}
      style={{
        ...btnGhost,
        padding: "8px 12px", fontSize: 13, fontWeight: 700,
        background: filterMode === mode ? bg : "#fff",
        borderColor: filterMode === mode ? col : "#c9cabb",
        color: col,
      }}>
      {label} ({count})
    </button>
  );
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 18px 120px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button onClick={onBack} style={btnGhost}><ChevronLeft size={20} /> Zurück</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontSize: 30, color: INK, margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>Alle Berichte</h1>
          <p style={{ margin: "4px 0 0", color: "#8a8b79", fontSize: 14 }}>
            {items.length} {items.length === 1 ? "Bericht" : "Berichte"} insgesamt auf diesem Gerät
          </p>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Suchen nach Baustelle, Bauführer, Datum…"
          style={{ ...inputStyle, fontSize: 16, padding: "12px 14px" }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {filterBtn("all",      "Alle",             items.length,   "#eef0e6", INK)}
        {filterBtn("uploaded", "Hochgeladen",      stats.uploaded, "#eef7e6", DARKGREEN)}
        {filterBtn("pending",  "Nicht hochgeladen", stats.pending, "#f0f0e6", "#6b6c5c")}
        {filterBtn("error",    "Fehler",           stats.error,    "#fce7e7", "#a1372f")}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a9b89" }}>
          <FileText size={48} style={{ opacity: .4 }} />
          <p style={{ fontSize: 16, marginTop: 12 }}>{q.trim() || filterMode !== "all" ? "Keine passenden Berichte." : "Noch keine Berichte gespeichert."}</p>
        </div>
      )}
      {filtered.map(it => (
        <div key={it.id} onClick={() => onOpen(it.id)} style={{
          display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", marginBottom: 10,
          background: "#fff", border: "2px solid #e3e3d4", borderRadius: 14, cursor: "pointer",
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#eef7e6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText size={22} color={GREEN} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.bauvorhaben || "Ohne Baustelle"}
              </span>
              <UploadBadge meta={it} />
            </div>
            <div style={{ fontSize: 13, color: "#8a8b79", marginTop: 2 }}>
              {it.datum || "—"}{it.bauführer ? " · " + it.bauführer : ""}
              {it.uploaded && it.uploadedAt ? " · hochgeladen " + formatUploadedAt(it.uploadedAt) : ""}
            </div>
          </div>
          {onRetry && (it.uploadError || !it.uploaded) && (
            <button onClick={(e) => { e.stopPropagation(); onRetry(it.id); }}
              style={{ ...btnGhost, padding: "8px 12px", borderColor: "#0078d4", color: "#0078d4", fontSize: 13, fontWeight: 700 }}
              title={it.uploadError ? "Erneut hochladen. Letzter Fehler:\n" + it.uploadError : "Bericht in OneDrive hochladen"}>
              <Share2 size={16} /> Upload
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(it.id); }} style={{ ...btnGhost, padding: 10, borderColor: "#e0c4c4", color: "#b04a4a" }} title="Bericht löschen">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

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
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: INK }}>{it.datum}</span>
                <UploadBadge meta={it} />
              </div>
              <div style={{ fontSize: 14, color: "#8a8b79", marginTop: 2 }}>
                {it.bauführer ? "Bauführer: " + it.bauführer : "Kein Bauführer eingetragen"}
                {it.uploaded && it.uploadedAt ? " · hochgeladen " + formatUploadedAt(it.uploadedAt) : ""}
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
function loadScript(src, checkFn) {
  // checkFn: optionale Funktion, die prüft ob die Bibliothek schon verfügbar ist
  return new Promise((resolve, reject) => {
    if (checkFn && checkFn()) return resolve();
    if (document.querySelector(`script[src="${src}"]`)) {
      // schon im DOM – kurz warten bis verfügbar
      let tries = 0;
      const iv = setInterval(() => {
        if (!checkFn || checkFn()) { clearInterval(iv); resolve(); }
        else if (++tries > 50) { clearInterval(iv); reject(new Error("Skript nicht geladen: " + src)); }
      }, 100);
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Skript konnte nicht geladen werden (Internet?)"));
    document.body.appendChild(s);
    setTimeout(() => { if (checkFn && !checkFn()) reject(new Error("Zeitüberschreitung beim Laden")); }, 8000);
  });
}
const hasJsPDF = () => !!(window.jspdf && window.jspdf.jsPDF);
const hasJSZip = () => !!window.JSZip;

async function exportPDF(r) {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", hasJsPDF);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 40;
  // 2 Nachkommastellen, OHNE Rundung (abgeschnitten)
  const fmt2 = (h) => {
    if (h == null || isNaN(h)) return "0,00";
    const sign = h < 0 ? "-" : "";
    const abs = Math.abs(h);
    const truncated = Math.floor(abs * 100) / 100;
    return sign + truncated.toFixed(2).replace(".", ",");
  };
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
  if (r.techniker) line("Techniker:", r.techniker);
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
    ["lehrling", "Lehrlinge"],
  ];
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  const parse = (v) => { const n = parseFloat(String(v || "").replace(",", ".")); return isNaN(n) ? 0 : n; };
  const hoursFor = (a, name) => {
    if (a && a.stundenPro && a.stundenPro[name] !== undefined && a.stundenPro[name] !== "") return parse(a.stundenPro[name]);
    return parse(a && a.std);
  };
  rows.forEach(([k, lbl], i) => {
    const a = r.arbeiter[k] || {};
    const namen = (a.namen || "").trim();
    const nameArr = namen ? namen.split(",").map(s => s.trim()).filter(Boolean) : [];
    const anzText = nameArr.length > 0 ? String(nameArr.length) : (a.n || "—");
    // Namen mit individuellen Stunden zusammensetzen: "Name (8 Std.)"
    const nameWithHours = nameArr.length > 0
      ? nameArr.map(n => {
          const h = hoursFor(a, n);
          return h > 0 ? `${n} (${fmt2(h)} Std.)` : n;
        })
      : [];
    const nameDisplay = nameWithHours.length > 0 ? nameWithHours.join(", ") : (namen || "—");
    const nameLines = doc.splitTextToSize(nameDisplay, colNamen - 12);
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
    doc.text(anzText, xAnz + colAnzahl / 2, y + 14, { align: "center" });
    // Stunden-Spalte: Summe der Kategorie
    let catSum = 0;
    if (nameArr.length > 0) nameArr.forEach(n => { catSum += hoursFor(a, n); });
    else catSum = parse(a.std) * (parse(a.n) > 0 ? parse(a.n) : 1);
    const catStr = catSum > 0 ? fmt2(catSum) : "—";
    doc.text(catStr, xStd + colStunden / 2, y + 14, { align: "center" });
    nameLines.forEach((ln, j) => doc.text(ln, xNam + 6, y + 14 + j * 12));
    y += rowH;
  });

  // Gesamt-Zeile
  if (y + 22 > H - 60) { doc.addPage(); y = 50; }
  doc.setFillColor(238, 247, 230);
  doc.rect(ML, y, TBL_W, 22, "F");
  doc.setDrawColor(180); doc.rect(ML, y, TBL_W, 22);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(62, 122, 40);
  doc.text("Arbeitsleistung ohne Gerät", xKat + 6, y + 15);
  // Gesamtstunden über alle Kategorien
  let total = 0;
  Object.entries(r.arbeiter || {}).forEach(([key, a]) => {
    const namen = (a && a.namen) ? a.namen.split(",").map(s => s.trim()).filter(Boolean) : [];
    if (namen.length > 0) namen.forEach(n => { total += hoursFor(a, n); });
    else { const std = parse(a && a.std); total += std * (parse(a && a.n) > 0 ? parse(a.n) : 1); }
  });
  const totalStr = fmt2(total) + " Std.";
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
  // Material-Block: kleine Tabelle Bezeichnung / Menge / Einheit
  const materialBlock = (label, arr) => {
    if (y > H - 110) { doc.addPage(); y = 50; }
    y += 6; doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(label, ML, y); y += 14;
    const items = Array.isArray(arr) ? arr.filter(it => it && (it.bezeichnung || it.menge || it.einheit)) : [];
    if (items.length === 0) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text("—", ML, y); y += 14; return;
    }
    const tblW = W - 2 * ML;
    const cBez = tblW * 0.62;
    const cMen = tblW * 0.18;
    const cEin = tblW * 0.20;
    // Kopf
    doc.setFillColor(238, 240, 230);
    doc.rect(ML, y, tblW, 16, "F");
    doc.setDrawColor(200); doc.setLineWidth(0.4);
    doc.rect(ML, y, tblW, 16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(62, 122, 40);
    doc.text("Bezeichnung", ML + 5, y + 11);
    doc.text("Menge", ML + cBez + cMen / 2, y + 11, { align: "center" });
    doc.text("Einheit", ML + cBez + cMen + cEin / 2, y + 11, { align: "center" });
    y += 16;
    doc.setTextColor(40, 40, 30);
    items.forEach((it, i) => {
      const bezLines = doc.splitTextToSize(it.bezeichnung || "—", cBez - 10);
      const rowH = Math.max(16, bezLines.length * 12 + 4);
      if (y + rowH > H - 60) { doc.addPage(); y = 50; }
      if (i % 2 === 0) {
        doc.setFillColor(251, 251, 244);
        doc.rect(ML, y, tblW, rowH, "F");
      }
      doc.setDrawColor(230); doc.rect(ML, y, tblW, rowH);
      doc.line(ML + cBez, y, ML + cBez, y + rowH);
      doc.line(ML + cBez + cMen, y, ML + cBez + cMen, y + rowH);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      bezLines.forEach((ln, j) => doc.text(ln, ML + 5, y + 12 + j * 12));
      doc.text(it.menge || "—", ML + cBez + cMen / 2, y + 12, { align: "center" });
      doc.text(it.einheit || "—", ML + cBez + cMen + cEin / 2, y + 12, { align: "center" });
      y += rowH;
    });
    y += 6;
  };
  // Fahrzeuge-Block mit eigener Stundensumme
  const fahrzeugBlock = () => {
    const items = Array.isArray(r.fahrzeuge) ? r.fahrzeuge.filter(it => it && (it.name || it.std)) : [];
    if (items.length === 0) return;
    if (y > H - 110) { doc.addPage(); y = 50; }
    y += 6; doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Fahrzeuge / Hebegeräte", ML, y); y += 14;
    const tblW = W - 2 * ML;
    const cName = tblW * 0.78;
    const cStd = tblW * 0.22;
    // Kopf
    doc.setFillColor(255, 240, 220);
    doc.rect(ML, y, tblW, 16, "F");
    doc.setDrawColor(200); doc.rect(ML, y, tblW, 16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(138, 90, 28);
    doc.text("Fahrzeug / Hebegerät", ML + 5, y + 11);
    doc.text("Stunden", ML + cName + cStd / 2, y + 11, { align: "center" });
    y += 16;
    doc.setTextColor(40, 40, 30);
    let totalFz = 0;
    items.forEach((it, i) => {
      const rowH = 18;
      if (y + rowH > H - 60) { doc.addPage(); y = 50; }
      if (i % 2 === 0) { doc.setFillColor(251, 251, 244); doc.rect(ML, y, tblW, rowH, "F"); }
      doc.setDrawColor(230); doc.rect(ML, y, tblW, rowH);
      doc.line(ML + cName, y, ML + cName, y + rowH);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(it.name || "—", ML + 5, y + 13);
      doc.text(it.std || "—", ML + cName + cStd / 2, y + 13, { align: "center" });
      const n = parseFloat(String(it.std || "").replace(",", "."));
      if (!isNaN(n)) totalFz += n;
      y += rowH;
    });
    // Summen-Zeile
    if (y + 20 > H - 60) { doc.addPage(); y = 50; }
    doc.setFillColor(255, 232, 200);
    doc.rect(ML, y, tblW, 20, "F");
    doc.setDrawColor(180); doc.rect(ML, y, tblW, 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(138, 90, 28);
    doc.text("Gerätestunden gesamt", ML + 5, y + 13);
    const totalFzStr = fmt2(totalFz) + " Std.";
    doc.text(totalFzStr, ML + tblW - 6, y + 13, { align: "right" });
    doc.setTextColor(40, 40, 30);
    y += 26;
  };
  // Regie-Leistungen-Block: Bezeichnung / Personen / Stunden mit Gesamt
  const regieLeistungBlock = () => {
    const items = Array.isArray(r.regieLeistungen) ? r.regieLeistungen.filter(it => it && (it.bezeichnung || it.personen || it.stunden)) : [];
    if (y > H - 110) { doc.addPage(); y = 50; }
    y += 6; doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Regie-Leistungen", ML, y); y += 14;
    if (items.length === 0) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text("—", ML, y); y += 14; return;
    }
    const tblW = W - 2 * ML;
    const cBez = tblW * 0.60;
    const cPer = tblW * 0.18;
    const cStd = tblW * 0.22;
    // Kopf
    doc.setFillColor(238, 240, 230);
    doc.rect(ML, y, tblW, 16, "F");
    doc.setDrawColor(200); doc.setLineWidth(0.4);
    doc.rect(ML, y, tblW, 16);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(62, 122, 40);
    doc.text("Bezeichnung", ML + 5, y + 11);
    doc.text("Personen", ML + cBez + cPer / 2, y + 11, { align: "center" });
    doc.text("Stunden", ML + cBez + cPer + cStd / 2, y + 11, { align: "center" });
    y += 16;
    doc.setTextColor(40, 40, 30);
    const parse = (v) => { const n = parseFloat(String(v || "").replace(",", ".")); return isNaN(n) ? 0 : n; };
    let totalRegie = 0;
    items.forEach((it, i) => {
      const bezLines = doc.splitTextToSize(it.bezeichnung || "—", cBez - 10);
      const rowH = Math.max(16, bezLines.length * 12 + 4);
      if (y + rowH > H - 60) { doc.addPage(); y = 50; }
      if (i % 2 === 0) { doc.setFillColor(251, 251, 244); doc.rect(ML, y, tblW, rowH, "F"); }
      doc.setDrawColor(230); doc.rect(ML, y, tblW, rowH);
      doc.line(ML + cBez, y, ML + cBez, y + rowH);
      doc.line(ML + cBez + cPer, y, ML + cBez + cPer, y + rowH);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      bezLines.forEach((ln, j) => doc.text(ln, ML + 5, y + 12 + j * 12));
      doc.text(it.personen || "—", ML + cBez + cPer / 2, y + 12, { align: "center" });
      doc.text(it.stunden || "—", ML + cBez + cPer + cStd / 2, y + 12, { align: "center" });
      const std = parse(it.stunden);
      const per = parse(it.personen);
      totalRegie += std * (per > 0 ? per : 1);
      y += rowH;
    });
    // Summe
    if (y + 20 > H - 60) { doc.addPage(); y = 50; }
    doc.setFillColor(238, 247, 230);
    doc.rect(ML, y, tblW, 20, "F");
    doc.setDrawColor(180); doc.rect(ML, y, tblW, 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(62, 122, 40);
    doc.text("Regie-Stunden gesamt (zusätzlich)", ML + 5, y + 13);
    const totalRegieStr = fmt2(totalRegie) + " Std.";
    doc.text(totalRegieStr, ML + tblW - 6, y + 13, { align: "right" });
    doc.setTextColor(40, 40, 30);
    y += 26;
  };
  bulletBlock("Leistungsergebnisse", r.leistungsergebnisse);
  materialBlock("Material", r.material);
  regieLeistungBlock();
  materialBlock("Regie-Material", r.regieMaterial);
  fahrzeugBlock();

  // Unterschrift
  if (y > H - 200) { doc.addPage(); y = 50; }
  y += 24;
  if (r.signature) {
    try { doc.addImage(r.signature, "PNG", ML, y, 260, 100); } catch (e) {}
  }
  doc.setDrawColor(0); doc.setLineWidth(0.6);
  doc.line(ML, y + 110, ML + 300, y + 110);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Unterschrift des Bauführers/-leiters", ML, y + 122);

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
  // Datum von YYYY-MM-DD in TT-MM-JJJJ umwandeln (Windows erlaubt keine / im Dateinamen)
  const datumTMJ = (() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(r.datum || "");
    return m ? `${m[3]}-${m[2]}-${m[1]}` : (r.datum || "ohne-Datum");
  })();
  const baseName  = `${baustelle}_${datumTMJ}`;
  const pdfName   = `${baseName}.pdf`;
  const fotosVoll = Array.isArray(r.fotos) ? r.fotos.filter(f => f && f.originalUrl) : [];

  // Wenn keine Fotos: nur PDF
  if (fotosVoll.length === 0) {
    const pdfBlob = doc.output("blob");
    return { blob: pdfBlob, fileName: pdfName, mime: "application/pdf" };
  }

  // Mit Fotos: ZIP mit PDF + Original-Bildern
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", hasJSZip);
  const zip = new window.JSZip();
  const pdfBlob = doc.output("blob");
  zip.file(pdfName, pdfBlob);
  const fotosOrdner = zip.folder("Fotos");
  for (let i = 0; i < fotosVoll.length; i++) {
    const foto = fotosVoll[i];
    const dataUrl = foto.originalUrl;
    const comma = dataUrl.indexOf(",");
    const meta = dataUrl.substring(5, comma);
    const isBase64 = meta.includes("base64");
    const mime = meta.split(";")[0] || "image/jpeg";
    const ext = mime.includes("png") ? "png" : (mime.includes("heic") ? "heic" : "jpg");
    const data = dataUrl.substring(comma + 1);
    const num = String(i + 1).padStart(2, "0");
    const kommentar = sanitize(foto.kommentar || "").substring(0, 60);
    const fname = `${baseName}_${num}${kommentar ? "_" + kommentar : ""}.${ext}`;
    fotosOrdner.file(fname, data, { base64: isBase64 });
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { blob: zipBlob, fileName: `${baseName}.zip`, mime: "application/zip" };
}

// Lädt einen Blob über einen versteckten Link herunter (Browser-Download).
function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Versucht, den nativen Teilen-Dialog des Geräts zu öffnen (iOS: "Auf Dateien sichern" / "OneDrive").
// Falls Web Share nicht unterstützt wird, fällt es auf einen normalen Download zurück.
async function shareBlob(blob, fileName, title) {
  try {
    if (navigator.canShare && typeof File !== "undefined") {
      const file = new File([blob], fileName, { type: blob.type || "application/octet-stream" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: title || fileName, text: title || fileName });
        return { shared: true };
      }
    }
  } catch (e) {
    // Nutzer hat abgebrochen oder Share nicht erlaubt – auf Download zurückfallen
    console.warn("share failed, fallback to download:", e);
  }
  downloadBlob(blob, fileName);
  return { shared: false };
}

// Lädt einen Blob als Base64 an den Power-Automate-Flow hoch.
// Die Datei landet dort direkt im OneDrive-Ordner des Admin-Kontos.
async function uploadToCloud(blob, fileName) {
  if (!UPLOAD_URL) throw new Error("Keine Upload-URL hinterlegt");
  // Blob -> Base64 (ohne "data:...;base64,"-Präfix)
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = reader.result || "";
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.substring(comma + 1) : s);
    };
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsDataURL(blob);
  });
  const res = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileContent: base64 }),
  });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch {}
    throw new Error("Upload fehlgeschlagen: " + res.status + " " + detail.substring(0, 150));
  }
  return true;
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

  const toastTimer = useRef(null);
  const showToast = (msg, ms) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), ms || 2500);
  };

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
    try {
      const rep = await loadReport(id);
      if (rep) {
        setCurrent(rep);
        setView("edit");
      } else {
        showToast("Bericht konnte nicht geöffnet werden");
      }
    } catch (e) {
      console.error("openReport failed:", e);
      showToast("Fehler beim Öffnen – siehe Konsole");
    }
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
    const result = await saveReport(toStore);
    if (!result || !result.ok) {
      const err = new Error("save_failed");
      err.reason = result && result.error;
      err.detail = result && result.detail;
      throw err;
    }
    const meta = {
      id: toStore.id,
      bauvorhaben: toStore.bauvorhaben,
      datum: toStore.datum,
      bauführer: toStore.bauführer,
      updatedAt: toStore.updatedAt,
      uploaded: !!toStore.uploaded,
      uploadedAt: toStore.uploadedAt || 0,
      uploadError: toStore.uploadError || "",
    };
    const idx = await loadIndex();
    const without = idx.filter(i => i.id !== meta.id);
    const next = [meta, ...without].sort((a, b) => b.updatedAt - a.updatedAt);
    await saveIndex(next);
    setIndex(next);
    return toStore;
  }, []);

  const handleSave = async () => {
    try {
      const saved = await persist(current);
      setCurrent(saved);
      setCurrentFolder(folderName(saved.bauvorhaben));
      showToast("Bericht gespeichert ✓");
    } catch (e) {
      console.error("Speicherfehler:", e, "Reason:", e && e.reason, "Detail:", e && e.detail);
      if (e && e.reason === "quota") {
        showToast("Speicher voll – bitte Fotos verkleinern oder alte Berichte löschen", 8000);
      } else if (e && e.detail) {
        showToast("Speichern fehlgeschlagen:\n" + String(e.detail).substring(0, 200), 10000);
      } else {
        showToast("Speichern fehlgeschlagen – siehe Konsole", 6000);
      }
    }
  };
  const buildExport = async (saved) => {
    // Liefert {blob, fileName, mime} oder wirft.
    return await exportPDF(saved);
  };

  const handleExport = async () => {
    // Speichern + Datei normal herunterladen
    let saved;
    try {
      saved = await persist(current);
      setCurrent(saved);
      setCurrentFolder(folderName(saved.bauvorhaben));
    } catch (e) {
      console.error(e);
      showToast(e && e.reason === "quota"
        ? "Speicher voll – Bericht konnte nicht gesichert werden"
        : "Speichern fehlgeschlagen");
      return;
    }
    const hasFotos = Array.isArray(saved.fotos) && saved.fotos.length > 0;
    showToast(hasFotos ? "ZIP wird erstellt (PDF + Fotos)…" : "PDF wird erstellt…");
    try {
      const out = await buildExport(saved);
      downloadBlob(out.blob, out.fileName);
      showToast(hasFotos ? "ZIP erstellt ✓" : "PDF erstellt ✓");
    } catch (e) {
      console.error(e);
      showToast("Export benötigt Internet – Bericht ist gespeichert");
    }
  };

  // Teilen über das System (iOS-Teilen-Dialog → OneDrive)
  const handleShare = async () => {
    let saved;
    try {
      saved = await persist(current);
      setCurrent(saved);
      setCurrentFolder(folderName(saved.bauvorhaben));
    } catch (e) {
      console.error(e);
      showToast(e && e.reason === "quota"
        ? "Speicher voll – Bericht konnte nicht gesichert werden"
        : "Speichern fehlgeschlagen");
      return;
    }
    const hasFotos = Array.isArray(saved.fotos) && saved.fotos.length > 0;
    let out;
    try {
      showToast(hasFotos ? "Datei wird vorbereitet (PDF + Fotos)…" : "Datei wird vorbereitet…");
      out = await buildExport(saved);
    } catch (e) {
      console.error(e);
      showToast("Datei konnte nicht erzeugt werden");
      return;
    }
    // Weg 1: Automatischer Upload an Power Automate (OneDrive)
    if (UPLOAD_URL) {
      showToast("Wird an OneDrive hochgeladen…");
      try {
        await uploadToCloud(out.blob, out.fileName);
        // Upload-Status im Bericht vermerken (klein, spart Speicher)
        const stamp = Date.now();
        const savedUp = { ...saved, uploaded: true, uploadedAt: stamp, uploadedFileName: out.fileName, uploadError: "" };
        try {
          await persist(savedUp);
          setCurrent(savedUp);
        } catch (e) { console.error("save upload status failed:", e); }
        showToast("An OneDrive hochgeladen ✓");
        return;
      } catch (e) {
        console.error("uploadToCloud failed:", e);
        const msg = (e && e.message) ? String(e.message) : "unbekannter Fehler";
        // Fehler-Status im Bericht speichern
        try {
          const savedErr = { ...saved, uploaded: false, uploadError: msg.substring(0, 300), uploadTriedAt: Date.now() };
          await persist(savedErr);
          setCurrent(savedErr);
        } catch (e2) { console.error("save upload error failed:", e2); }
        showToast(
          "Upload fehlgeschlagen:\n" + msg.substring(0, 200) +
          "\n\n(Tippen zum Schließen)",
          12000
        );
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    // Weg 2 (Fallback): iOS-Teilen-Dialog
    try {
      const title = `Bautagesbericht ${saved.bauvorhaben || ""} ${saved.datum || ""}`.trim();
      const result = await shareBlob(out.blob, out.fileName, title);
      showToast(result.shared ? "Geteilt ✓" : "Heruntergeladen ✓");
    } catch (e) {
      console.error(e);
      showToast("Teilen fehlgeschlagen – siehe Konsole");
    }
  };
  const handleDelete = async (id) => {
    await deleteReport(id);
    const idx = (await loadIndex()).filter(i => i.id !== id);
    await saveIndex(idx); setIndex(idx);
    showToast("Bericht gelöscht");
  };

  // Erneuter Upload eines bestehenden Berichts (aus der Übersicht heraus)
  const handleRetryUpload = async (id) => {
    const rep = await loadReport(id);
    if (!rep) { showToast("Bericht nicht gefunden"); return; }
    let out;
    try {
      showToast("Datei wird vorbereitet…");
      out = await buildExport(rep);
    } catch (e) {
      console.error(e);
      showToast("Datei konnte nicht erzeugt werden");
      return;
    }
    if (!UPLOAD_URL) { showToast("Keine Upload-URL hinterlegt"); return; }
    showToast("Wird an OneDrive hochgeladen…");
    try {
      await uploadToCloud(out.blob, out.fileName);
      const stamp = Date.now();
      const savedUp = { ...rep, uploaded: true, uploadedAt: stamp, uploadedFileName: out.fileName, uploadError: "" };
      await persist(savedUp);
      showToast("An OneDrive hochgeladen ✓");
    } catch (e) {
      console.error("retry uploadToCloud failed:", e);
      const msg = (e && e.message) ? String(e.message) : "unbekannter Fehler";
      try {
        const savedErr = { ...rep, uploaded: false, uploadError: msg.substring(0, 300), uploadTriedAt: Date.now() };
        await persist(savedErr);
      } catch (e2) { console.error(e2); }
      showToast("Upload fehlgeschlagen:\n" + msg.substring(0, 200) + "\n\n(Tippen zum Schließen)", 12000);
    }
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
        <FolderList folders={folders} onOpenFolder={openFolder} onNew={() => newReport()} onDeleteFolder={handleDeleteFolder} onOpenAll={() => setView("all")} />
      ) : view === "all" ? (
        <AllReports items={index} onOpen={openReport} onDelete={handleDelete} onBack={() => setView("folders")} onRetry={handleRetryUpload} />
      ) : view === "list" ? (
        <ReportList folderName={currentFolder} items={reportsInFolder(currentFolder)} onOpen={openReport} onNew={newReport} onDelete={handleDelete} onDuplicate={handleDuplicate} onBack={() => setView("folders")} />
      ) : (
        <Editor report={current} onChange={setCurrent} onBack={() => setView(currentFolder ? "list" : "folders")} onSave={handleSave} onExport={handleExport} onShare={handleShare} existingFolders={folders.map(f => f.name).filter(n => n !== FOLDER_FALLBACK)} />
      )}

      {toast && (
        <div
          onClick={() => setToast("")}
          style={{
            position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
            maxWidth: "92vw",
            background: INK, color: "#fff",
            padding: "14px 22px", borderRadius: 16,
            fontSize: 15, fontWeight: 600, lineHeight: 1.35,
            boxShadow: "0 6px 20px rgba(0,0,0,.25)", zIndex: 50,
            cursor: "pointer", whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}
          title="Tippen zum Schließen">
          {toast}
        </div>
      )}
    </div>
  );
}
