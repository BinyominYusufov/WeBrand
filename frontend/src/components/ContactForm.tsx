import { useState } from "react";
import {
  User, AtSign, Phone, Clock, ShieldCheck, Send, ArrowRight, ArrowLeft,
  Check, Sparkles, Megaphone, Palette, Code2, Target, HelpCircle,
  FileText, Building2, ShoppingCart, Store, Smartphone, LayoutGrid,
  TrendingUp, Eye, Heart, Rocket, Image, Monitor, Package, Presentation,
  PhoneCall, ShoppingBag, MousePointerClick, Radio,
  type LucideIcon,
} from "lucide-react";
import { contacts } from "../data/content";
import type { ApplyTarget } from "../context/ModalContext";

// Default in code so the running Vite dev server picks it up via HMR (no restart).
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

type Direction = { id: string; label: string; sub: string; icon: LucideIcon; wide?: boolean };
type QOption = { l: string; icon: LucideIcon };
type Question = { q: string; multi: boolean; options: QOption[] };
type Answers = Record<string, string | string[]>;

const DIRECTIONS: Direction[] = [
  { id: "smm", label: "SMM", sub: "соцсети и контент", icon: Megaphone },
  { id: "design", label: "Дизайн", sub: "лого, баннеры, UI", icon: Palette },
  { id: "dev", label: "Разработка", sub: "сайты и приложения", icon: Code2 },
  { id: "ads", label: "Реклама", sub: "таргет и Google", icon: Target },
  { id: "unsure", label: "Не знаю — помогите", sub: "подскажем направление", icon: HelpCircle, wide: true },
];

// Maps a Service title from content.ts to a form direction id, so opening the
// form from a specific service pre-selects the matching direction.
const SERVICE_TO_DIRECTION: Record<string, string> = {
  "Разработка сайтов": "dev",
  "Онлайн-эквайринг": "dev",
  "Дизайн и брендинг": "design",
  "SMM-маркетинг": "smm",
};

export function directionsForService(title: string): string[] {
  const dir = SERVICE_TO_DIRECTION[title];
  return dir ? [dir] : [];
}

// One main question per direction.
const QUESTIONS: Record<string, Question> = {
  dev: { q: "Что хотите сделать?", multi: false, options: [
    { l: "Landing page", icon: FileText },
    { l: "Корпоративный сайт", icon: Building2 },
    { l: "Интернет-магазин", icon: ShoppingCart },
    { l: "Маркетплейс", icon: Store },
    { l: "Мобильное приложение", icon: Smartphone },
    { l: "Веб-портал", icon: LayoutGrid },
  ]},
  smm: { q: "Что хотите получить?", multi: false, options: [
    { l: "Заявки и продажи (лиды)", icon: TrendingUp },
    { l: "Узнаваемость бренда", icon: Eye },
    { l: "Вовлечённость и охваты", icon: Heart },
    { l: "Запуск продукта", icon: Rocket },
  ]},
  design: { q: "Что нужно нарисовать?", multi: true, options: [
    { l: "Логотип", icon: Sparkles },
    { l: "Фирменный стиль / брендбук", icon: Palette },
    { l: "Креативы для соцсетей", icon: Image },
    { l: "UI/UX дизайн сайта", icon: Monitor },
    { l: "Полиграфия / упаковка", icon: Package },
    { l: "Презентация", icon: Presentation },
  ]},
  ads: { q: "Что хотите от рекламы?", multi: false, options: [
    { l: "Заявки и звонки (лиды)", icon: PhoneCall },
    { l: "Продажи", icon: ShoppingBag },
    { l: "Трафик на сайт", icon: MousePointerClick },
    { l: "Охваты и узнаваемость", icon: Radio },
  ]},
};

// Заявки уходят на бэкенд (Django), который валидирует, сохраняет лид и
// пересылает его в Telegram серверно. Токен бота больше не живёт в браузере.

// === Валидация контактов ===
const PHONE_PREFIX = "+992 ";
const NAME_RE = /^[\p{L}][\p{L}\s'’-]*$/u; // буквы (любой алфавит), пробел, апостроф, дефис
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG_RE = /^@?[A-Za-z0-9_]{5,32}$/;

// 9 национальных цифр после фиксированного префикса "+992 "
const nationalDigits = (v: string): string => {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("992")) d = d.slice(3);
  return d.slice(0, 9);
};
// Группировка 9 цифр: "98 864 55 43"
const formatPhone = (d: string): string => {
  let out = d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out;
};

function validateName(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Введите имя";
  if (t.length < 2) return "Минимум 2 символа";
  if (t.length > 50) return "Максимум 50 символов";
  if (!NAME_RE.test(t)) return "Только буквы, пробел и дефис";
  return undefined;
}
function validateContact(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Укажите email или Telegram";
  if (!EMAIL_RE.test(t) && !TG_RE.test(t)) return "Введите email или Telegram (@username)";
  return undefined;
}
function validatePhone(v: string): string | undefined {
  if (nationalDigits(v).length !== 9) return "Введите 9 цифр номера";
  return undefined;
}

type ContactErrors = { name?: string; contact?: string; phone?: string };
type ContactTouched = { name?: boolean; contact?: boolean; phone?: boolean };

const CSS = `
.cqf, .cqf * { box-sizing: border-box; }
.cqf {
  --brand:#2B5ED3; --brand-dark:#1E47A8; --brand-soft:#EEF3FC;
  --spring: cubic-bezier(.34,1.56,.64,1);
  font-family: system-ui, -apple-system, sans-serif;
}
@keyframes cqf-pop { 0%{transform:scale(0)} 60%{transform:scale(1.18)} 100%{transform:scale(1)} }
@keyframes cqf-ready { 0%,100%{box-shadow:0 8px 20px rgba(43,94,211,.28)} 50%{box-shadow:0 8px 28px rgba(43,94,211,.5)} }
@keyframes cqf-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.cqf .up { animation: cqf-up .5s var(--spring) both; }

.cqf .dircard {
  position:relative; display:flex; align-items:center; gap:13px;
  padding:15px 16px; border-radius:16px; border:1.5px solid #E6E9F0;
  background:#fff; cursor:pointer; text-align:left; width:calc(50% - 5px);
  transition: transform .18s var(--spring), border-color .2s ease, background .25s ease, box-shadow .25s ease;
}
.cqf .dircard.wide { width:100%; }
.cqf .dircard:hover { transform:translateY(-3px); border-color:#BFD0F0; box-shadow:0 12px 26px rgba(43,94,211,.13); }
.cqf .dircard:active { transform:translateY(-1px) scale(.975); }
.cqf .dircard.active { border-color:var(--brand); background:var(--brand-soft); }
.cqf .iconwrap {
  width:42px;height:42px;border-radius:12px;flex-shrink:0;
  background:#EFF3FB; color:var(--brand); display:flex;align-items:center;justify-content:center;
  transition: background .25s ease, color .25s ease, transform .25s var(--spring);
}
.cqf .dircard.active .iconwrap { background:var(--brand); color:#fff; transform:rotate(-6deg) scale(1.05); }
.cqf .dirlabel { display:block; font-size:15.5px; font-weight:600; color:#1F2937; }
.cqf .dircard.active .dirlabel { color:var(--brand-dark); }
.cqf .dirsub { display:block; font-size:12.5px; color:#9AA0AA; margin-top:1px; }
.cqf .badge {
  position:absolute; top:11px; right:11px; width:21px;height:21px;border-radius:50%;
  background:var(--brand); color:#fff; display:flex;align-items:center;justify-content:center;
  transform:scale(0); transition: transform .3s var(--spring);
}
.cqf .dircard.active .badge { animation: cqf-pop .35s var(--spring) forwards; }

.cqf .opt {
  display:flex; align-items:center; gap:13px; width:100%;
  padding:13px 15px; border-radius:14px; border:1.5px solid #E6E9F0; background:#fff;
  color:#1F2937; font-size:15px; font-weight:500; cursor:pointer; text-align:left;
  transition: transform .16s var(--spring), border-color .2s ease, background .25s ease, box-shadow .2s ease;
}
.cqf .opt:hover { transform:translateY(-2px); border-color:#BFD0F0; box-shadow:0 9px 22px rgba(43,94,211,.13); }
.cqf .opt:active { transform:translateY(0) scale(.985); }
.cqf .opt.active { border-color:var(--brand); background:var(--brand-soft); }
.cqf .opticon {
  width:40px;height:40px;border-radius:11px;flex-shrink:0;
  background:#EFF3FB; color:var(--brand); display:flex;align-items:center;justify-content:center;
  transition: background .25s ease, color .25s ease, transform .25s var(--spring);
}
.cqf .opt:hover .opticon { transform:scale(1.06); }
.cqf .opt.active .opticon { background:var(--brand); color:#fff; transform:scale(1.06); }
.cqf .optlabel { flex:1; }
.cqf .opt.active .optlabel { color:var(--brand-dark); }
.cqf .ind {
  width:21px;height:21px;flex-shrink:0; border:1.5px solid #CBD2DE; color:#fff;
  display:flex;align-items:center;justify-content:center;
  transition: background .2s ease, border-color .2s ease;
}
.cqf .ind.radio { border-radius:50%; }
.cqf .ind.check { border-radius:7px; }
.cqf .opt.active .ind { background:var(--brand); border-color:var(--brand); }
.cqf .ind > svg { opacity:0; transform:scale(.3); transition: opacity .18s ease, transform .3s var(--spring); }
.cqf .opt.active .ind > svg { opacity:1; transform:scale(1); }

.cqf .btn-primary {
  flex:1; padding:15px; border-radius:14px; border:none; background:var(--brand); color:#fff;
  font-size:16px; font-weight:600; cursor:pointer; display:flex; align-items:center;
  justify-content:center; gap:8px; transition: transform .15s var(--spring), background .2s ease, box-shadow .2s ease;
}
.cqf .btn-primary:hover:not(:disabled) { box-shadow:0 10px 24px rgba(43,94,211,.3); transform:translateY(-1px); }
.cqf .btn-primary:active:not(:disabled) { transform:translateY(0) scale(.98); }
.cqf .btn-primary:disabled { background:#BFD0F0; cursor:not-allowed; }
.cqf .btn-primary.ready { animation: cqf-ready 1.8s ease-in-out infinite; }
.cqf .btn-ghost {
  padding:15px 22px; border-radius:14px; border:1.5px solid #E6E9F0; background:#fff;
  color:#6B7280; font-size:15px; font-weight:500; cursor:pointer; display:flex;
  align-items:center; gap:6px; transition: border-color .2s ease, transform .15s var(--spring);
}
.cqf .btn-ghost:hover { border-color:#CBD2DE; }
.cqf .btn-ghost:active { transform:scale(.97); }

.cqf .field { position:relative; border:1.5px solid #E6E9F0; border-radius:14px;
  padding:10px 14px 10px 44px; background:#fff; transition: border-color .2s ease, box-shadow .2s ease; }
.cqf .field.focus { border-color:var(--brand); box-shadow:0 0 0 4px rgba(43,94,211,.1); }
.cqf .field.done { border-color:#BFD0F0; }
.cqf .field input { border:none; outline:none; width:100%; font-size:15px; color:#1F2937;
  background:transparent; padding:2px 0 0; }
.cqf .field input::placeholder { color:#B6BCC6; }
.cqf .tick { position:absolute; right:14px; top:15px; width:21px;height:21px;border-radius:50%;
  background:var(--brand); color:#fff; display:flex;align-items:center;justify-content:center;
  opacity:0; transform:scale(.4); transition: opacity .2s ease, transform .3s var(--spring); }
.cqf .field.done .tick { opacity:1; transform:scale(1); }

.cqf .field.error { border-color:#E5484D; box-shadow:0 0 0 4px rgba(229,72,77,.1); }
.cqf a.cqf-tglink { transition: opacity .2s ease; }
.cqf a.cqf-tglink:hover { opacity:.82; text-decoration:underline !important; }

/* === Мобильный адаптив (≤640px). !important — чтобы перебить инлайн-стили карточки. === */
@media (max-width:640px) {
  /* Левая синяя панель не нужна на телефоне */
  .cqf .cqf-side { display:none !important; }
  /* Форма занимает всю ширину, отступы компактнее — без тесноты и гориз. скролла */
  .cqf .cqf-body { padding:22px 16px 20px !important; }
  /* Заголовок-строка: правый отступ под кнопку-крестик модалки, чтобы «Шаг X из Y» не перекрывался */
  .cqf .cqf-head { padding-right:40px !important; }
  /* Карточки направлений — в один столбец на всю ширину */
  .cqf .dircard { width:100% !important; padding:15px 16px !important; }
  /* Крупные тап-таргеты */
  .cqf .opt { padding:15px 16px !important; }
  .cqf .field { padding-top:12px !important; padding-bottom:12px !important; }
  .cqf .field input { font-size:16px !important; } /* ≥16px — iOS не зумит при фокусе */
  .cqf .btn-primary,
  .cqf .btn-ghost { padding:16px 16px !important; font-size:16px !important; }
}
`;

export default function ContactForm({
  initialSelected = [],
  applyTarget = null,
}: {
  initialSelected?: string[];
  applyTarget?: ApplyTarget | null;
}) {
  const isApplication = !!applyTarget;
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [answers, setAnswers] = useState<Answers>({});
  const [screen, setScreen] = useState(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [message, setMessage] = useState("");
  // Honeypot: bots fill this hidden field; humans never see it. A non-empty
  // value makes the backend silently 200 without saving.
  const [company, setCompany] = useState("");
  const [touched, setTouched] = useState<ContactTouched>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  // In application mode there is no quiz — go straight to the contacts step.
  const questionDirs = isApplication
    ? []
    : DIRECTIONS.filter((d) => selected.includes(d.id) && QUESTIONS[d.id]).map((d) => d.id);
  const totalSteps = isApplication ? 1 : 1 + questionDirs.length + 1;
  const contactsScreen = isApplication ? 0 : 1 + questionDirs.length;
  const onSelection = !isApplication && screen === 0;
  const onContacts = screen === contactsScreen;
  const currentDir = !onSelection && !onContacts ? questionDirs[screen - 1] : null;
  const unsureOnly = selected.includes("unsure") && questionDirs.length === 0;

  const toggleDirection = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((s) => s !== id) : [...p, id]));

  const setAnswer = (dir: string, opt: string, multi: boolean) =>
    setAnswers((prev) => {
      const cur = prev[dir];
      if (multi) {
        const a = Array.isArray(cur) ? cur : [];
        return { ...prev, [dir]: a.includes(opt) ? a.filter((o) => o !== opt) : [...a, opt] };
      }
      return { ...prev, [dir]: opt };
    });

  // Keep the fixed "+992 " prefix, accept only digits, cap at 9, auto-format
  const onPhoneChange = (v: string) => setPhone(PHONE_PREFIX + formatPhone(nationalDigits(v)));
  const blur = (k: keyof ContactTouched) => setTouched((t) => ({ ...t, [k]: true }));

  const errName = validateName(name);
  const errContact = validateContact(contact);
  const errPhone = validatePhone(phone);
  const errors: ContactErrors = {
    name: touched.name ? errName : undefined,
    contact: touched.contact ? errContact : undefined,
    phone: touched.phone ? errPhone : undefined,
  };

  const filled = (errName ? 0 : 1) + (errContact ? 0 : 1) + (errPhone ? 0 : 1);
  const progress = onContacts
    ? Math.round(((screen + filled / 3) / totalSteps) * 100)
    : Math.round((screen / totalSteps) * 100) + (selected.length ? 8 : 0);
  const canSubmit = !errName && !errContact && !errPhone;

  const handleSubmit = async () => {
    if (!canSubmit || sending) {
      setTouched({ name: true, contact: true, phone: true });
      return;
    }
    setError(false);

    // Honeypot included on every request; the server decides what to do with it.
    const payload = isApplication
      ? {
          kind: "application",
          role: applyTarget!.role,
          name: name.trim(),
          contact: contact.trim(),
          phone,
          message: message.trim(),
          company,
        }
      : {
          kind: "lead",
          selected,
          answers,
          name: name.trim(),
          contact: contact.trim(),
          phone,
          company,
        };

    try {
      setSending(true);
      const res = await fetch(`${API_BASE}/api/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // 2xx + {ok:true} = saved (or honeypot silently accepted). Anything else is an error.
      let data: { ok?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON (e.g. throttle HTML) — treated as error below */
      }
      if (res.ok && data.ok) setSubmitted(true);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  let heading = "";
  let subtitle = "";
  if (onSelection) {
    heading = "С чего начнём?";
    subtitle = "Выберите одно или несколько направлений.";
  } else if (currentDir) {
    heading = QUESTIONS[currentDir].q;
    subtitle = QUESTIONS[currentDir].multi ? "Можно выбрать несколько." : "Нажмите вариант — двинемся дальше.";
  } else if (onContacts && isApplication) {
    heading = "Отклик на вакансию";
    subtitle = `${applyTarget!.title} — оставьте контакты, и мы свяжемся с вами.`;
  } else if (onContacts) {
    heading = "Куда прислать ответ?";
    subtitle = unsureOnly
      ? "Оставьте контакты — свяжемся и вместе разберёмся, что нужно."
      : "Пришлём 2-3 варианта с ценами в течение пары часов.";
  }

  return (
    <div className="cqf" style={{ width: "100%", maxWidth: 880, display: "flex", borderRadius: 24,
      overflow: "hidden", boxShadow: "0 30px 80px rgba(43,94,211,0.18)", background: "#fff" }}>
      <style>{CSS}</style>

        <div className="hidden sm:flex cqf-side" style={{ width: "40%",
          background: "linear-gradient(160deg, #2B5ED3 0%, #1E47A8 100%)", color: "#fff",
          padding: "36px 30px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12,
              letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} /> Новый проект
            </div>
            <h2 style={{ fontSize: 32, lineHeight: 1.1, fontWeight: 700, margin: "20px 0 14px" }}>
              Расскажите<br />о задаче
            </h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, opacity: 0.9 }}>
              Один вопрос — и подберём решение. Позвоним только если сами попросите.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Trust icon={Clock} title="Отвечаем за пару часов" sub="в рабочее время" />
            <Trust icon={ShieldCheck} title="30+ компаний доверяют" sub="медицина, e-commerce, услуги" />
          </div>
          <div style={{ fontSize: 14, lineHeight: 2 }}>
            <a href={contacts.telegram} target="_blank" rel="noopener noreferrer" className="cqf-tglink"
              style={{ display: "flex", alignItems: "center", gap: 8, color: "#fff", textDecoration: "none" }}>
              <Send size={15} /> Написать в Telegram
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={15} /> {contacts.phone}</div>
          </div>
        </div>

        <div className="cqf-body" style={{ flex: 1, padding: "34px 34px 26px", minWidth: 0 }}>
          {submitted ? (
            <SuccessView selected={selected} unsure={unsureOnly} isApplication={isApplication} roleTitle={applyTarget?.title} />
          ) : (
            <>
              <div className="cqf-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{heading}</h3>
                <span style={{ fontSize: 13, color: "#9AA0AA", whiteSpace: "nowrap" }}>
                  Шаг {screen + 1} из {totalSteps}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#6B7280", margin: "6px 0 0" }}>{subtitle}</p>

              <div style={{ height: 6, borderRadius: 99, background: "#EDF0F5",
                margin: "18px 0 24px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`,
                  background: "#2B5ED3", borderRadius: 99, transition: "width .4s cubic-bezier(.34,1.56,.64,1)" }} />
              </div>

              {/* Honeypot — visually hidden, off the tab order. Bots fill it; humans don't. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />

              {onSelection && (
                <StepSelection selected={selected} toggle={toggleDirection} onNext={() => setScreen(1)} />
              )}
              {currentDir && (
                <StepQuestion key={currentDir} dir={currentDir} value={answers[currentDir]}
                  setAnswer={setAnswer} onBack={() => setScreen(screen - 1)} onNext={() => setScreen(screen + 1)} />
              )}
              {onContacts && (
                <StepContacts key="contacts" name={name} setName={setName} contact={contact}
                  setContact={setContact} phone={phone} setPhone={onPhoneChange} canSubmit={canSubmit}
                  sending={sending} error={error} errors={errors} onBlur={blur}
                  showMessage={isApplication} message={message} setMessage={setMessage}
                  onBack={isApplication ? undefined : () => setScreen(screen - 1)} onSubmit={handleSubmit} />
              )}
            </>
          )}
        </div>
      </div>
  );
}

function Trust({ icon: Icon, title, sub }: { icon: LucideIcon; title: string; sub: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} /></div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12.5, opacity: 0.8 }}>{sub}</div>
      </div>
    </div>
  );
}

function StepSelection({ selected, toggle, onNext }: {
  selected: string[]; toggle: (id: string) => void; onNext: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {DIRECTIONS.map(({ id, label, sub, icon: Icon, wide }, i) => {
          const active = selected.includes(id);
          return (
            <button key={id} onClick={() => toggle(id)}
              className={`dircard up ${active ? "active" : ""} ${wide ? "wide" : ""}`}
              style={{ animationDelay: `${i * 55}ms` }}>
              <span className="iconwrap"><Icon size={20} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="dirlabel">{label}</span>
                <span className="dirsub">{sub}</span>
              </span>
              <span className="badge"><Check size={13} strokeWidth={3} /></span>
            </button>
          );
        })}
      </div>
      <NavButtons onNext={onNext} nextLabel="Далее" nextDisabled={!selected.length}
        ready={selected.length > 0} footer="Бесплатно. Ни к чему не обязывает." />
    </div>
  );
}

function StepQuestion({ dir, value, setAnswer, onBack, onNext }: {
  dir: string;
  value: string | string[] | undefined;
  setAnswer: (dir: string, opt: string, multi: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { options, multi } = QUESTIONS[dir];
  const [advancing, setAdvancing] = useState(false);

  const choose = (label: string) => {
    setAnswer(dir, label, multi);
    if (!multi && !advancing) {
      setAdvancing(true);
      setTimeout(onNext, 340);
    }
  };

  const isActive = (l: string) => (multi ? Array.isArray(value) && value.includes(l) : value === l);
  const hasAnswer = multi ? Array.isArray(value) && value.length > 0 : !!value;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {options.map((opt, i) => {
          const Ico = opt.icon;
          return (
            <button key={opt.l} className={`opt up ${isActive(opt.l) ? "active" : ""}`}
              style={{ animationDelay: `${i * 55}ms` }} onClick={() => choose(opt.l)}>
              <span className="opticon"><Ico size={20} /></span>
              <span className="optlabel">{opt.l}</span>
              <span className={`ind ${multi ? "check" : "radio"}`}><Check size={13} strokeWidth={3.5} /></span>
            </button>
          );
        })}
      </div>
      {multi ? (
        <NavButtons onBack={onBack} onNext={onNext} nextLabel="Далее" ready={hasAnswer} />
      ) : (
        <div style={{ marginTop: 22 }}>
          <button className="btn-ghost" onClick={onBack}><ArrowLeft size={17} /> Назад</button>
        </div>
      )}
    </div>
  );
}

function StepContacts({ name, setName, contact, setContact, phone, setPhone, canSubmit, sending, error, errors, onBlur, onBack, onSubmit, showMessage, message, setMessage }: {
  name: string; setName: (v: string) => void;
  contact: string; setContact: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  canSubmit: boolean; sending: boolean; error: boolean;
  errors: ContactErrors; onBlur: (k: "name" | "contact" | "phone") => void;
  onBack?: () => void; onSubmit: () => void;
  showMessage?: boolean; message?: string; setMessage?: (v: string) => void;
}) {
  return (
    <div>
      <div className="up" style={{ animationDelay: "0ms" }}>
        <Field icon={User} label="Имя" value={name} onChange={setName} maxLength={50}
          placeholder="Как к вам обращаться" done={name.trim().length > 0}
          error={errors.name} onBlur={() => onBlur("name")} />
      </div>
      <div className="up" style={{ animationDelay: "90ms" }}>
        <Field icon={AtSign} label="Telegram или email" value={contact} onChange={setContact} maxLength={60}
          placeholder="@username или email" done={contact.trim().length > 0}
          error={errors.contact} onBlur={() => onBlur("contact")} />
      </div>
      <div className="up" style={{ animationDelay: "180ms" }}>
        <Field icon={Phone} label="Телефон" value={phone} onChange={setPhone} placeholder="+992 ..."
          inputMode="tel" maxLength={17}
          hint="Нужен, чтобы связаться, если в мессенджере не ответите. Без спам-звонков."
          done={validatePhone(phone) === undefined}
          error={errors.phone} onBlur={() => onBlur("phone")} />
      </div>
      {showMessage && (
        <div className="up" style={{ animationDelay: "270ms", marginBottom: 14 }}>
          <div className="field" style={{ paddingLeft: 14 }}>
            <label style={{ display: "block", fontSize: 11.5, color: "#9AA0AA", fontWeight: 500 }}>
              Сообщение <span style={{ color: "#9AA0AA" }}>(необязательно)</span>
            </label>
            <textarea
              value={message ?? ""}
              maxLength={2000}
              onChange={(e) => setMessage?.(e.target.value)}
              placeholder="Пара слов о себе, опыт, ссылки на работы…"
              rows={3}
              style={{ border: "none", outline: "none", width: "100%", fontSize: 15, color: "#1F2937",
                background: "transparent", resize: "vertical", marginTop: 4, fontFamily: "inherit" }}
            />
          </div>
        </div>
      )}
      {error && (
        <p style={{ fontSize: 13, color: "#D14545", margin: "2px 2px 0", lineHeight: 1.4 }}>
          Не получилось отправить. Напишите нам в{" "}
          <a href="https://t.me/bobodushanbe" style={{ color: "#2B5ED3", fontWeight: 600 }}>Telegram</a>.
        </p>
      )}
      <NavButtons onBack={onBack} onNext={onSubmit}
        nextLabel={sending ? "Отправляем…" : "Получить решение"} nextIcon={Send}
        nextDisabled={!canSubmit || sending} ready={canSubmit && !sending}
        footer="Позвоним только если сами попросите. По умолчанию пишем в Telegram." />
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel, nextIcon: NextIcon = ArrowRight, nextDisabled, ready, footer }: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextIcon?: LucideIcon;
  nextDisabled?: boolean;
  ready?: boolean;
  footer?: string;
}) {
  return (
    <>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        {onBack && <button className="btn-ghost" onClick={onBack}><ArrowLeft size={17} /> Назад</button>}
        <button className={`btn-primary ${ready && !nextDisabled ? "ready" : ""}`} onClick={onNext} disabled={nextDisabled}>
          {nextLabel} <NextIcon size={18} />
        </button>
      </div>
      {footer && <p style={{ textAlign: "center", fontSize: 12.5, color: "#9AA0AA", marginTop: 12 }}>{footer}</p>}
    </>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, hint, done, error, onBlur, maxLength, inputMode }: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  done: boolean;
  error?: string;
  onBlur?: () => void;
  maxLength?: number;
  inputMode?: "text" | "email" | "tel";
}) {
  const [focus, setFocus] = useState(false);
  const accent = error ? "#E5484D" : focus || done ? "#2B5ED3" : "#9AA0AA";
  return (
    <div style={{ marginBottom: 14 }}>
      <div className={`field ${focus ? "focus" : ""} ${done && !error ? "done" : ""} ${error ? "error" : ""}`}>
        <Icon size={18} color={accent}
          style={{ position: "absolute", left: 14, top: 16, transition: "color .25s ease" }} />
        <label style={{ display: "block", fontSize: 11.5, color: error ? "#E5484D" : focus ? "#2B5ED3" : "#9AA0AA",
          fontWeight: 500, transition: "color .25s ease" }}>
          {label} <span style={{ color: "#2B5ED3" }}>*</span>
        </label>
        <input value={value} maxLength={maxLength} inputMode={inputMode} aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); onBlur?.(); }} placeholder={placeholder} />
        <span className="tick"><Check size={13} strokeWidth={3} /></span>
      </div>
      {error ? (
        <p role="alert" style={{ fontSize: 12, color: "#E5484D", margin: "5px 4px 0", lineHeight: 1.4 }}>{error}</p>
      ) : hint ? (
        <p style={{ fontSize: 12, color: "#9AA0AA", margin: "5px 4px 0", lineHeight: 1.4 }}>{hint}</p>
      ) : null}
    </div>
  );
}

function SuccessView({ selected, unsure, isApplication, roleTitle }: {
  selected: string[]; unsure: boolean; isApplication?: boolean; roleTitle?: string;
}) {
  const labels = DIRECTIONS.filter((s) => selected.includes(s.id) && s.id !== "unsure").map((s) => s.label);
  return (
    <div style={{ height: "100%", minHeight: 380, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(43,94,211,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={30} color="#2B5ED3" />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
        {isApplication ? "Отклик отправлен!" : "Заявка отправлена!"}
      </h3>
      <p style={{ fontSize: 15, color: "#6B7280", maxWidth: 330, lineHeight: 1.5 }}>
        {isApplication
          ? `Спасибо за отклик${roleTitle ? ` на «${roleTitle}»` : ""}! Посмотрим и свяжемся с вами в течение пары дней.`
          : unsure
          ? "Напишем в Telegram в течение пары часов, зададим пару вопросов и поможем разобраться."
          : `Напишем в Telegram в течение пары часов и пришлём варианты решения${labels.length ? ` по: ${labels.join(", ")}` : ""}.`}
      </p>
    </div>
  );
}