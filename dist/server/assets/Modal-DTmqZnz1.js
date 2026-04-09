import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
function DataTable({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Buscar...",
  actions,
  emptyMessage = "No hay datos disponibles"
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filtered = searchable ? data.filter(
    (row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
  ) : data;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  return /* @__PURE__ */ jsxs("div", { className: "card overflow-hidden p-0", children: [
    searchable && /* @__PURE__ */ jsx("div", { className: "border-b border-[var(--siu-border-light)] bg-[var(--siu-blue-soft)]/50 px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "relative max-w-md", children: [
      /* @__PURE__ */ jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--siu-text-muted)]" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: search,
          onChange: (e) => {
            setSearch(e.target.value);
            setPage(1);
          },
          placeholder: searchPlaceholder,
          className: "form-input pl-9"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "siu-table w-full border-collapse text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "table-header", children: [
        columns.map((col) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-white", children: col.label }, col.key)),
        actions && /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-white", children: "Acciones" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "border border-[var(--siu-border-light)]", children: paginated.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + (actions ? 1 : 0), className: "border border-[var(--siu-border-light)] bg-white px-4 py-10 text-center text-[var(--siu-text-muted)]", children: emptyMessage }) }) : paginated.map((row, i) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-[var(--siu-border-light)] transition-colors", children: [
        columns.map((col) => /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-slate-700", children: col.render ? col.render(row) : String(row[col.key] ?? "-") }, col.key)),
        actions && /* @__PURE__ */ jsx("td", { className: "px-4 py-2.5 text-right", children: actions(row) })
      ] }, i)) })
    ] }) }),
    totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-t border-[var(--siu-border-light)] bg-[var(--siu-blue-soft)]/30 px-4 py-2.5", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-[var(--siu-text-muted)]", children: [
        filtered.length,
        " reg. · Pág. ",
        page,
        " / ",
        totalPages
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            disabled: page === 1,
            className: "rounded-sm border border-[var(--siu-border)] bg-white p-1.5 text-[var(--siu-navy)] hover:bg-[var(--siu-blue-soft)] disabled:cursor-not-allowed disabled:opacity-40",
            children: /* @__PURE__ */ jsx(ChevronLeft, { size: 16 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
            disabled: page === totalPages,
            className: "rounded-sm border border-[var(--siu-border)] bg-white p-1.5 text-[var(--siu-navy)] hover:bg-[var(--siu-blue-soft)] disabled:cursor-not-allowed disabled:opacity-40",
            children: /* @__PURE__ */ jsx(ChevronRight, { size: 16 })
          }
        )
      ] })
    ] })
  ] });
}
function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  const sizeClass = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: `modal-content w-full ${sizeClass}`,
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "siu-modal-head", children: [
          /* @__PURE__ */ jsx("h2", { children: title }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onClose,
              className: "rounded-sm p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white",
              "aria-label": "Cerrar",
              children: /* @__PURE__ */ jsx(X, { size: 20 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-5", children })
      ]
    }
  ) });
}
export {
  DataTable as D,
  Modal as M
};
