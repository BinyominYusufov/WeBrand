# Webrand

Digital-агентство — сайт-визитка с услугами, портфолио и контактной формой.

**Стек:** React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion

## Локальная разработка

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production-сборка в dist/
npm run preview  # просмотр сборки
```

## Структура

```
src/
├── components/        # Navbar, Hero, About, Services, Process, Portfolio,
│                      # Partners, CTA, Footer, ContactModal
├── context/           # ModalContext — глобальный контроль модалки
├── data/content.ts    # все данные (услуги, портфолио, партнёры, контакты)
├── App.tsx
└── main.tsx
```

## Деплой

Проект готов к деплою на Vercel — Vite определяется автоматически.
