export const AUTH_BRANDS = {
  admin: {
    accent: "#f472b6",
    accentStrong: "#a855f7",
    accentSoft: "rgba(244, 114, 182, 0.18)",
    gradient: "linear-gradient(135deg, #2a0a4d 0%, #6d28d9 45%, #f472b6 100%)",
  },
  agent: {
    accent: "#34d399",
    accentStrong: "#0f766e",
    accentSoft: "rgba(52, 211, 153, 0.18)",
    gradient: "linear-gradient(135deg, #012a24 0%, #0f766e 45%, #34d399 100%)",
  },
  employee: {
    accent: "#38bdf8",
    accentStrong: "#2563eb",
    accentSoft: "rgba(56, 189, 248, 0.18)",
    gradient: "linear-gradient(135deg, #021024 0%, #0f4c81 45%, #38bdf8 100%)",
  },
  hr: {
    accent: "#a5b4fc",
    accentStrong: "#4c1d95",
    accentSoft: "rgba(165, 180, 252, 0.2)",
    gradient: "linear-gradient(135deg, #0b1220 0%, #1e1b4b 45%, #818cf8 100%)",
  },
  support: {
    accent: "#fbbf24",
    accentStrong: "#c2410c",
    accentSoft: "rgba(251, 191, 36, 0.2)",
    gradient: "linear-gradient(135deg, #241a00 0%, #92400e 45%, #fbbf24 100%)",
  },
};

export const buildHero = (brand = {}, overrides = {}) => ({
  badge: "InsurAI Platform",
  title: "Unified",
  highlight: "Workspace",
  description: "Secure-by-design experiences built for regulated enterprises.",
  bullets: [
    { title: "Zero-trust perimeter", description: "Adaptive MFA and device trust baked in." },
    { title: "Observability", description: "Full-session logging for every critical workflow." },
  ],
  stats: [
    { value: "24/7", label: "Security coverage" },
    { value: "99.99%", label: "Platform uptime" },
  ],
  notice: "All logins are subject to SOC 2 and ISO 27001 monitoring requirements.",
  ...brand,
  ...overrides,
});
