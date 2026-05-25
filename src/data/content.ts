export const nav = [
  { label: "О компании", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "Вакансии", href: "#careers" },
]

export const heroTags = [
  "Разработка сайтов",
  "Дизайн / Брендинг",
  "SMM",
  "SEO / Контекстная реклама",
  "Анимация",
]

export const services = [
  {
    id: 1,
    number: "01",
    title: "Разработка сайтов",
    description: "Разработка современных, адаптивных и функциональных сайтов для бизнеса.",
    points: ["Лендинги", "Корпоративные сайты", "Web-приложения", "E-commerce"],
  },
  {
    id: 2,
    number: "02",
    title: "Онлайн-эквайринг",
    description: "Подключение удобных и безопасных платежных решений для бизнеса.",
    points: ["Приём платежей", "Подписки", "Интеграции", "Безопасность"],
  },
  {
    id: 3,
    number: "03",
    title: "Дизайн и брендинг",
    description: "Создание уникального визуального стиля для вашего бизнеса и продукта.",
    points: ["Логотип", "Айдентика", "UI/UX", "Brand-book"],
  },
  {
    id: 4,
    number: "04",
    title: "SMM-маркетинг",
    description: "Продвижение вашего бизнеса в социальных сетях для привлечения клиентов.",
    points: ["Контент-план", "Визуал", "Таргет", "Аналитика"],
  },
]

export type PortfolioItem = {
  id: number
  name: string
  subtitle: string
  description: string
  category: "Разработка" | "SMM"
  tags: string[]
  accent: string
}

export const portfolio: PortfolioItem[] = [
  {
    id: 1,
    name: "Khotiri Jam",
    subtitle: "центр детской терапии",
    description: "Корпоративный сайт медицинского центра с акцентом на доверие, команду специалистов и онлайн-запись.",
    category: "Разработка",
    tags: ["Website", "Healthcare", "UX"],
    accent: "#14B8A6",
  },
  {
    id: 2,
    name: "SABT Business",
    subtitle: "онлайн-запись для бизнеса",
    description: "SaaS-платформа для записи клиентов, управления расписанием и автоматических напоминаний.",
    category: "Разработка",
    tags: ["SaaS", "CRM", "Booking"],
    accent: "#8B5CF6",
  },
  {
    id: 3,
    name: "Todo",
    subtitle: "маркетплейс еды и продуктов",
    description: "Платформа для подключения магазинов, увеличения продаж и узнаваемости брендов.",
    category: "Разработка",
    tags: ["Marketplace", "E-commerce", "Web App"],
    accent: "#EC4899",
  },
  {
    id: 4,
    name: "BARF",
    subtitle: "корпоративные подарки",
    description: "Создание интернет-магазина для новогодних корпоративных подарков с акцентом на премиальность.",
    category: "Разработка",
    tags: ["Landing", "Brand", "E-commerce"],
    accent: "#DC2626",
  },
  {
    id: 5,
    name: "GetUp",
    subtitle: "интернет-магазин автозапчастей",
    description: "Каталог автозапчастей с фильтрами по маркам и быстрой системой заказов.",
    category: "Разработка",
    tags: ["E-commerce", "Catalog", "Platform"],
    accent: "#F59E0B",
  },
  {
    id: 6,
    name: "SHAKL",
    subtitle: "дизайн интерьеров",
    description: "SMM и визуал для бренда интерьеров: позиционирование и привлечение премиум-аудитории.",
    category: "SMM",
    tags: ["Instagram", "Visual", "Brand"],
    accent: "#1F2937",
  },
  {
    id: 7,
    name: "Loftory",
    subtitle: "мебель и столы",
    description: "Контент и визуал для локального бренда мебели с фокусом на стиль и продукт.",
    category: "SMM",
    tags: ["Instagram", "Product", "Visual"],
    accent: "#92400E",
  },
  {
    id: 8,
    name: "Armut Cafe",
    subtitle: "турецкая кухня",
    description: "Продвижение ресторана: контент, вовлечённость и формирование лояльной аудитории.",
    category: "SMM",
    tags: ["Restaurant", "Instagram", "Engagement"],
    accent: "#0891B2",
  },
  {
    id: 9,
    name: "BARF",
    subtitle: "подарочные боксы",
    description: "SMM и визуал для корпоративных и персональных подарков.",
    category: "SMM",
    tags: ["Instagram", "Sales", "Brand"],
    accent: "#B91C1C",
  },
  {
    id: 10,
    name: "SABT",
    subtitle: "онлайн-запись",
    description: "Контент и объяснение продукта для сервиса онлайн-записи и автоматизации.",
    category: "SMM",
    tags: ["SaaS", "Instagram", "Education"],
    accent: "#7C3AED",
  },
  {
    id: 11,
    name: "Sapporo",
    subtitle: "доставка японской кухни",
    description: "Продвижение доставки еды: визуал, акции и постоянная коммуникация.",
    category: "SMM",
    tags: ["Food", "Delivery", "Instagram"],
    accent: "#DC2626",
  },
  {
    id: 12,
    name: "ASAN",
    subtitle: "клиника офтальмологии",
    description: "Контент для медицинской клиники: доверие, экспертиза и услуги.",
    category: "SMM",
    tags: ["Healthcare", "Instagram", "Trust"],
    accent: "#059669",
  },
]

export const partners = [
  "Корманд TJ",
  "SHAKL",
  "SABT",
  "Айва",
  "JN",
  "LOFTORY",
  "GetUp",
  "АСАН",
  "Армут",
  "STAR",
  "SAPPORO",
  "BARF",
]

export const contacts = {
  phone: "+992 988 64 55 43",
  phoneRaw: "+992988645543",
  email: "info@webrand.tj",
  telegram: "https://t.me/",
  socials: {
    instagram: "#",
    tiktok: "#",
    telegram: "#",
    whatsapp: "#",
    facebook: "#",
  },
}
