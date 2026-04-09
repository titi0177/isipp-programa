import { jsx, jsxs } from "react/jsx-runtime";
import { isValidElement } from "react";
const SEMANTIC_ICON_WRAP = {
  bordeaux: "bg-[#582c31]/12 text-[#3d1f22]",
  blue: "bg-sky-100 text-sky-800 border border-sky-200/80",
  green: "bg-emerald-100 text-emerald-800 border border-emerald-200/80",
  orange: "bg-amber-100 text-amber-900 border border-amber-200/80",
  purple: "bg-violet-100 text-violet-800 border border-violet-200/80"
};
function iconWrapClasses(color) {
  const c = color ?? "bordeaux";
  if (c.includes(" ") || c.startsWith("bg-")) return c;
  return SEMANTIC_ICON_WRAP[c] ?? SEMANTIC_ICON_WRAP.bordeaux;
}
function StatCard({ icon, title, value, color }) {
  const wrapClass = iconWrapClasses(color);
  const iconNode = isValidElement(icon) ? icon : /* @__PURE__ */ (() => {
    const Icon = icon;
    return /* @__PURE__ */ jsx(Icon, { size: 22 });
  })();
  return /* @__PURE__ */ jsxs("div", { className: "card flex items-center gap-4 border-l-4 border-l-[var(--isipp-bordo)] p-5", children: [
    /* @__PURE__ */ jsx("div", { className: `rounded-sm border p-3 ${wrapClass}`, children: iconNode }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-wide text-[var(--siu-text-muted)]", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold tracking-tight text-[var(--siu-navy)]", children: value })
    ] })
  ] });
}
export {
  StatCard as S
};
