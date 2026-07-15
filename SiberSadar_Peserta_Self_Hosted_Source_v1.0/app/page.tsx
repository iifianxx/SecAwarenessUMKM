"use client";

import { useEffect, useMemo, useState } from "react";
import { lessons, postQuestions, preQuestions, roleOrder, roles, type Question, type RoleKey } from "@/lib/training";

type Screen = "home" | "role" | "pre" | "learn" | "practice" | "checklist" | "post" | "result" | "certificate" | "verify";
type Certificate = { code: string; role: string; score: number; scenarioScore: number; issued: string };

const steps: { screen: Screen; label: string }[] = [
  { screen: "role", label: "Peran" }, { screen: "pre", label: "Tes awal" }, { screen: "learn", label: "Materi" },
  { screen: "practice", label: "Latihan" }, { screen: "checklist", label: "Aksi" }, { screen: "post", label: "Tes akhir" }, { screen: "result", label: "Hasil" },
];

function score(answers: number[], questions: Question[]) {
  return answers.reduce((total, value, index) => total + (value === questions[index]?.answer ? 1 : 0), 0);
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [role, setRole] = useState<RoleKey | null>(null);
  const [pre, setPre] = useState<number[]>(Array(5).fill(-1));
  const [post, setPost] = useState<number[]>(Array(5).fill(-1));
  const [practice, setPractice] = useState<number[]>(Array(3).fill(-1));
  const [checks, setChecks] = useState<boolean[]>(Array(4).fill(false));
  const [lesson, setLesson] = useState(0);
  const [practiceStep, setPracticeStep] = useState(0);
  const [questionStep, setQuestionStep] = useState(0);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certificateName, setCertificateName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<Record<string, unknown> | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("verify");
      if (code) {
        setVerifyCode(code);
        setScreen("verify");
        setVerifying(true);
        try {
          const response = await fetch(`/api/certificate?code=${encodeURIComponent(code.trim())}`);
          setVerifyResult(await response.json());
        } catch {
          setVerifyResult({ valid: false });
        }
        setVerifying(false);
        return;
      }

      const raw = localStorage.getItem("sibersadar-v2");
      if (raw) {
        try {
          const saved = JSON.parse(raw) as { role?: RoleKey; certificate?: Certificate };
          if (saved.role && saved.role in roles) setRole(saved.role);
          if (saved.certificate) setCertificate(saved.certificate);
        } catch { /* abaikan data lama */ }
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const activeRole = role ? roles[role] : null;
  const preSet = useMemo(() => role ? preQuestions(role) : [], [role]);
  const postSet = useMemo(() => role ? postQuestions(role) : [], [role]);
  const preScore = useMemo(() => score(pre, preSet), [pre, preSet]);
  const postScore = useMemo(() => score(post, postSet), [post, postSet]);
  const practiceScore = useMemo(() => role ? score(practice, roles[role].scenarios) : 0, [practice, role]);
  const percent = postScore * 20;
  const passed = percent >= 80 && practiceScore >= 2;
  const currentStep = Math.max(0, steps.findIndex((item) => item.screen === screen));

  function choose(list: number[], setter: (value: number[]) => void, index: number, value: number) {
    const next = [...list]; next[index] = value; setter(next);
  }

  function selectRole(value: RoleKey) {
    setRole(value); setPre(Array(5).fill(-1)); setPost(Array(5).fill(-1)); setPractice(Array(3).fill(-1)); setChecks(Array(4).fill(false)); setCertificate(null);
  }

  async function finish() {
    if (!role) return;
    setIssuing(true); setIssueError("");
    if (passed) {
      try {
        const response = await fetch("/api/certificate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, post, scenarios: practice }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Sertifikat gagal dibuat.");
        setCertificate(data);
        localStorage.setItem("sibersadar-v2", JSON.stringify({ role, result: { pre: preScore * 20, practice: practiceScore, post: percent }, certificate: data }));
      } catch (error) { setIssueError(error instanceof Error ? error.message : "Sertifikat gagal dibuat."); }
    }
    setIssuing(false); setScreen("result"); window.scrollTo(0, 0);
  }

  async function verify(code = verifyCode) {
    if (!code.trim()) return;
    setVerifying(true); setVerifyResult(null);
    try { const response = await fetch(`/api/certificate?code=${encodeURIComponent(code.trim())}`); setVerifyResult(await response.json()); }
    catch { setVerifyResult({ valid: false }); }
    setVerifying(false);
  }

  function go(next: Screen) { setScreen(next); window.scrollTo(0, 0); }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => go("home")} aria-label="Kembali ke beranda"><span className="brand-mark">S</span><span>SiberSadar <small>UMKM</small></span></button>
        {screen !== "home" && screen !== "verify" && <div className="progress-shell" aria-label={`Langkah ${currentStep + 1} dari ${steps.length}`}><span style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} /></div>}
        <button className="verify-link" onClick={() => go("verify")}>Validasi sertifikat</button>
      </header>

      {screen === "home" && <section className="hero page">
        <div className="hero-copy"><span className="eyebrow">Latihan sesuai peran • 20 menit</span><h1>Ancaman berbeda.<br/><em>Langkah aman tetap sederhana.</em></h1><p>Pilih peranmu, hadapi kasus yang relevan, lalu bawa pulang rencana 7 dan 30 hari.</p><div className="cia-strip"><span><b>Rahasia</b><small>tidak bocor</small></span><span><b>Benar & utuh</b><small>tidak dimanipulasi</small></span><span><b>Tersedia</b><small>saat dibutuhkan</small></span></div><div className="hero-actions"><button className="primary" onClick={() => go("role")}>Pilih peran <span>→</span></button>{certificate && <button className="secondary" onClick={() => go("certificate")}>Lihat sertifikat</button>}</div><div className="trust-row"><span>✓ Tanpa OTP/PIN</span><span>✓ Nama tidak dikirim</span><span>✓ Hasil langsung</span></div></div>
        <div className="mascot-stage"><div className="speech">Hai, aku <strong>Sibi!</strong><br/>Aku sesuaikan latihan dengan pekerjaanmu.</div><img className="mascot" src="/sibi-mascot.png" alt="Sibi, maskot perisai ramah SiberSadar"/><div className="shadow"/></div>
      </section>}

      {screen === "role" && <section className="page compact wide"><SectionHead eyebrow="Langkah 1" title="Apa peran utamamu?" text="Pilih pekerjaan yang paling sering kamu lakukan. Tidak perlu memilih jabatan formal."/><div className="role-grid">{roleOrder.map((key) => <button key={key} className={role === key ? "role-card selected" : "role-card"} onClick={() => selectRole(key)}><span className="role-icon">{roles[key].icon}</span><strong>{roles[key].title}</strong><small>{roles[key].short}</small><em>{roles[key].focus}</em></button>)}</div><div className="sibi-note"><img src="/sibi-mascot.png" alt=""/><span><strong>Kenapa pilih peran?</strong> SKKNI 236/2024 meminta konteks sasaran, kebutuhan, materi, dan media ditentukan berdasarkan kebutuhan. Pilihan ini membuat kasus dekat dengan pekerjaan harian.</span></div><Actions back={() => go("home")} next={() => { setQuestionStep(0); go("pre"); }} disabled={!role} nextLabel="Mulai tes awal"/></section>}

      {screen === "pre" && role && <Quiz eyebrow="Tes awal" title="Coba dulu, tanpa takut salah" subtitle={`5 pertanyaan untuk ${activeRole?.title}. Hasil ini hanya menjadi titik awal.`} questions={preSet} answers={pre} step={questionStep} onChoose={(value) => choose(pre, setPre, questionStep, value)} onBack={() => questionStep ? setQuestionStep(questionStep - 1) : go("role")} onNext={() => questionStep < 4 ? setQuestionStep(questionStep + 1) : (setLesson(0), go("learn"))} nextLabel={questionStep === 4 ? "Lanjut belajar" : "Berikutnya"}/>}

      {screen === "learn" && activeRole && <section className="page compact"><SectionHead eyebrow="Materi inti" title="5 langkah saat ragu" text="Satu kartu, satu tindakan. Baca lalu lanjut."/><div className="lesson-card"><div className="lesson-icon">{lessons[lesson].icon}</div><div><span className="counter">{lesson + 1} / {lessons.length}</span><span className="lesson-anchor">{lessons[lesson].anchor}</span><h3>{lessons[lesson].title}</h3><p>{lessons[lesson].lead}</p><ul>{lessons[lesson].points.map((point) => <li key={point}>{point}</li>)}</ul></div></div><div className="role-tip"><strong>Untuk peranmu:</strong> {activeRole.roleTip}</div><div className="stepper">{lessons.map((_, index) => <button key={index} className={index === lesson ? "current" : index < lesson ? "done" : ""} onClick={() => setLesson(index)} aria-label={`Materi ${index + 1}`}/>)}</div><Actions back={() => lesson ? setLesson(lesson - 1) : go("pre")} next={() => lesson < lessons.length - 1 ? setLesson(lesson + 1) : (setPracticeStep(0), go("practice"))} nextLabel={lesson < lessons.length - 1 ? "Lanjut" : "Mulai latihan"}/></section>}

      {screen === "practice" && activeRole && <section className="page compact"><SectionHead eyebrow="Latihan peran" title="Pilih tindakan, lihat alasannya" text={activeRole.focus}/><div className="scenario-card"><div className="scenario-top"><span>Kasus {practiceStep + 1} dari 3</span><span className="risk">{activeRole.title}</span></div><h3>{activeRole.scenarios[practiceStep].prompt}</h3><div className="choice-list">{activeRole.scenarios[practiceStep].choices.map((choice, index) => <button key={choice} disabled={practice[practiceStep] !== -1} className={practice[practiceStep] === index ? (index === activeRole.scenarios[practiceStep].answer ? "correct" : "wrong") : ""} onClick={() => choose(practice, setPractice, practiceStep, index)}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}</div>{practice[practiceStep] !== -1 && <div className={practice[practiceStep] === activeRole.scenarios[practiceStep].answer ? "feedback good" : "feedback retry"}><strong>{practice[practiceStep] === activeRole.scenarios[practiceStep].answer ? "Tepat." : "Belum aman."}</strong> {activeRole.scenarios[practiceStep].why}</div>}</div><Actions back={() => practiceStep ? setPracticeStep(practiceStep - 1) : go("learn")} next={() => practiceStep < 2 ? setPracticeStep(practiceStep + 1) : go("checklist")} disabled={practice[practiceStep] === -1} nextLabel={practiceStep < 2 ? "Kasus berikutnya" : "Buat rencana aksi"}/></section>}

      {screen === "checklist" && activeRole && <section className="page compact"><SectionHead eyebrow="Cek praktik" title="Apa yang sudah ada hari ini?" text="Centang kondisi yang benar. Yang belum dicentang menjadi rencana tindakanmu."/><div className="check-card">{activeRole.checklist.map((item, index) => <label key={item}><input type="checkbox" checked={checks[index]} onChange={() => { const next = [...checks]; next[index] = !next[index]; setChecks(next); }}/><span><strong>{checks[index] ? "Sudah" : "Belum"}</strong>{item}</span></label>)}</div><div className="commitment"><span>Komitmen sederhana</span><strong>“{activeRole.promise}”</strong></div><Actions back={() => go("practice")} next={() => { setQuestionStep(0); go("post"); }} nextLabel="Mulai tes akhir"/></section>}

      {screen === "post" && role && <Quiz eyebrow="Tes akhir" title="Tunjukkan keputusan amanmu" subtitle="Nilai lulus 80 dan minimal 2 dari 3 latihan kasus benar." questions={postSet} answers={post} step={questionStep} onChoose={(value) => choose(post, setPost, questionStep, value)} onBack={() => questionStep ? setQuestionStep(questionStep - 1) : go("checklist")} onNext={() => questionStep < 4 ? setQuestionStep(questionStep + 1) : void finish()} nextLabel={questionStep === 4 ? (issuing ? "Memeriksa…" : "Lihat hasil") : "Berikutnya"}/>} 

      {screen === "result" && activeRole && <section className="page result-page"><img className="result-mascot" src="/sibi-mascot.png" alt="Sibi tersenyum"/><span className="eyebrow">Hasil • {activeRole.title}</span><div className="score-ring" style={{ "--score": `${percent * 3.6}deg` } as React.CSSProperties}><div><strong>{percent}</strong><span>/100</span></div></div><h2>{passed ? "Lulus — kamu SiberSiaga!" : "Belum lulus — satu putaran lagi"}</h2><p>{passed ? "Kamu telah menyelesaikan materi dan menunjukkan keputusan aman pada asesmen." : "Ulangi materi yang relevan, lalu coba tes akhir lagi. Nilai lulus 80 dan latihan minimal 2/3."}</p><div className="mini-stats"><div><span>Tes awal</span><strong>{preScore * 20}</strong></div><div><span>Latihan</span><strong>{practiceScore}/3</strong></div><div><span>Tes akhir</span><strong>{percent}</strong></div></div>{issueError && <div className="feedback retry">{issueError}</div>}<div className="followup-grid"><div><span>Hari ke-7 • Ingat</span><strong>Uji satu kebiasaan</strong><p>Periksa MFA, kontak konfirmasi, dan satu akun penting.</p></div><div><span>Hari ke-30 • Terapkan</span><strong>Tutup satu celah</strong><p>Selesaikan satu item “Belum” dan bagikan cara aman ke satu rekan.</p></div></div><div className="hero-actions">{passed && certificate ? <button className="primary" onClick={() => go("certificate")}>Ambil badge & sertifikat →</button> : <button className="primary" onClick={() => { setLesson(0); go("learn"); }}>Ulangi materi</button>}<button className="secondary" onClick={() => { setQuestionStep(0); go("post"); }}>Ulangi tes akhir</button></div><p className="scope-note">Badge membuktikan penyelesaian pelatihan awareness ini, bukan sertifikasi profesi keamanan siber.</p></section>}

      {screen === "certificate" && activeRole && certificate && <section className="page certificate-page"><div className="certificate-controls no-print"><SectionHead eyebrow="Bukti penyelesaian" title="Masukkan nama untuk dicetak" text="Nama hanya dipakai di perangkat ini dan tidak dikirim ke server."/><input className="name-input" value={certificateName} onChange={(event) => setCertificateName(event.target.value)} placeholder="Nama lengkap peserta" maxLength={80}/><div className="hero-actions"><button className="primary" disabled={!certificateName.trim()} onClick={() => window.print()}>Cetak / Simpan PDF</button><button className="secondary" onClick={() => go("result")}>Kembali</button></div></div><CertificateCard certificate={certificate} name={certificateName || "Nama Peserta"} role={activeRole.title}/></section>}

      {screen === "verify" && <section className="page compact verify-page"><SectionHead eyebrow="Validasi" title="Periksa kode sertifikat" text="Validasi membuktikan kode diterbitkan setelah kriteria pelatihan terpenuhi."/><div className="verify-card"><label htmlFor="verify-code">Kode sertifikat</label><textarea id="verify-code" rows={4} value={verifyCode} onChange={(event) => setVerifyCode(event.target.value)} placeholder="Tempel kode SSU-…"/><button className="primary" onClick={() => void verify()} disabled={!verifyCode.trim() || verifying}>{verifying ? "Memeriksa…" : "Validasi kode"}</button></div>{verifyResult && <div className={verifyResult.valid ? "validation valid" : "validation invalid"}>{verifyResult.valid ? <><strong>✓ Kode valid</strong><span>{String(verifyResult.scope)}</span><dl><div><dt>Peran</dt><dd>{String(verifyResult.role)}</dd></div><div><dt>Nilai</dt><dd>{String(verifyResult.score)}/100</dd></div><div><dt>Tanggal</dt><dd>{formatDate(String(verifyResult.issued))}</dd></div></dl></> : <><strong>✕ Kode tidak valid</strong><span>Periksa kembali seluruh kode yang ditempel.</span></>}</div>}<button className="text-button" onClick={() => go("home")}>← Kembali ke beranda</button></section>}

      <footer><span>SiberSadar UMKM • Jeda, Cek, Konfirmasi</span><span>Jika ada kerugian: hubungi bank segera, simpan bukti, lapor melalui IASC dan Kepolisian.</span></footer>
    </main>
  );
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="section-head"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>; }

function Actions({ back, next, disabled = false, nextLabel }: { back: () => void; next: () => void; disabled?: boolean; nextLabel: string }) { return <div className="footer-actions"><button className="secondary" onClick={back}>Kembali</button><button className="primary" disabled={disabled} onClick={next}>{nextLabel} →</button></div>; }

function Quiz({ eyebrow, title, subtitle, questions, answers, step, onChoose, onBack, onNext, nextLabel }: { eyebrow: string; title: string; subtitle: string; questions: Question[]; answers: number[]; step: number; onChoose: (value: number) => void; onBack: () => void; onNext: () => void; nextLabel: string }) {
  const question = questions[step];
  return <section className="page compact"><SectionHead eyebrow={eyebrow} title={`${step + 1} dari ${questions.length} • ${title}`} text={subtitle}/><div className="quiz-progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }}/></div><div className="quiz-card"><h3>{question.prompt}</h3><div className="choice-list">{question.choices.map((choice, index) => <button key={choice} className={answers[step] === index ? "selected" : ""} onClick={() => onChoose(index)}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}</div></div><Actions back={onBack} next={onNext} disabled={answers[step] === -1} nextLabel={nextLabel}/></section>;
}

function CertificateCard({ certificate, name, role }: { certificate: Certificate; name: string; role: string }) {
  const verifyUrl = typeof window === "undefined" ? "" : `${window.location.origin}/?verify=${encodeURIComponent(certificate.code)}`;
  return <article className="certificate-card" id="certificate"><div className="cert-border"><div className="cert-brand"><span className="brand-mark">S</span><strong>SiberSadar UMKM</strong></div><img className="cert-mascot" src="/sibi-mascot.png" alt="Sibi"/><img className="cert-badge" src="/sibersadar-badge-sibersiaga.png" alt="Badge penyelesaian SiberSiaga"/><p className="cert-kicker">SERTIFIKAT PENYELESAIAN</p><h2>{name}</h2><p>telah menyelesaikan pelatihan awareness keamanan siber berbasis peran</p><h3>{role}</h3><div className="cert-score"><span>Nilai akhir <strong>{certificate.score}/100</strong></span><span>Latihan <strong>{certificate.scenarioScore}/3</strong></span><span>Terbit <strong>{formatDate(certificate.issued)}</strong></span></div><div className="cert-code"><span>Kode validasi</span><code>{certificate.code}</code><small>{verifyUrl}</small></div><p className="cert-scope">Bukti penyelesaian awareness. Bukan Sertifikat Kompetensi BNSP/LSP dan bukan sertifikasi profesi.</p></div></article>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`)); }
