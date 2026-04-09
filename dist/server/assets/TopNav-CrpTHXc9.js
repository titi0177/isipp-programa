import { jsxs, jsx } from "react/jsx-runtime";
import { useRouterState, Link } from "@tanstack/react-router";
import { ChevronRight, LogOut, LayoutDashboard, Users, GraduationCap, BookOpen, UserCheck, ClipboardList, Star, ClipboardCheck, Link2, BookMarked, FileText, Bell, BarChart3, Calendar, Settings, User, ChevronDown } from "lucide-react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { useState } from "react";
const LOGO_SRC$1 = "/logo-isipp.png";
const LOGO_ALT = "Instituto Superior de Informática Puerto Piray";
const professorNav = [
  { label: "Inicio", href: "/professor", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 18 }) },
  { label: "Mis asignaturas", href: "/professor/subjects", icon: /* @__PURE__ */ jsx(BookOpen, { size: 18 }) },
  { label: "Calificaciones", href: "/professor/grades", icon: /* @__PURE__ */ jsx(Star, { size: 18 }) },
  { label: "Asistencia", href: "/professor/attendance", icon: /* @__PURE__ */ jsx(ClipboardCheck, { size: 18 }) },
  { label: "Materiales", href: "/professor/materials", icon: /* @__PURE__ */ jsx(FileText, { size: 18 }) },
  { label: "Seguridad", href: "/professor/settings", icon: /* @__PURE__ */ jsx(Settings, { size: 18 }) }
];
const adminNav = [
  { label: "Inicio", href: "/admin", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 18 }) },
  { label: "Estudiantes", href: "/admin/students", icon: /* @__PURE__ */ jsx(Users, { size: 18 }) },
  { label: "Propuestas formativas", href: "/admin/programs", icon: /* @__PURE__ */ jsx(GraduationCap, { size: 18 }) },
  { label: "Asignaturas", href: "/admin/subjects", icon: /* @__PURE__ */ jsx(BookOpen, { size: 18 }) },
  { label: "Docentes", href: "/admin/professors", icon: /* @__PURE__ */ jsx(UserCheck, { size: 18 }) },
  { label: "Inscripciones a cursadas", href: "/admin/enrollments", icon: /* @__PURE__ */ jsx(ClipboardList, { size: 18 }) },
  { label: "Actas / Calificaciones", href: "/admin/grades", icon: /* @__PURE__ */ jsx(Star, { size: 18 }) },
  { label: "Asistencia", href: "/admin/attendance", icon: /* @__PURE__ */ jsx(ClipboardCheck, { size: 18 }) },
  { label: "Correlativas", href: "/admin/correlatives", icon: /* @__PURE__ */ jsx(Link2, { size: 18 }) },
  { label: "Mesas de exámenes", href: "/admin/final-exams", icon: /* @__PURE__ */ jsx(BookMarked, { size: 18 }) },
  { label: "Actas de examen", href: "/admin/exam-records", icon: /* @__PURE__ */ jsx(FileText, { size: 18 }) },
  { label: "Novedades", href: "/admin/announcements", icon: /* @__PURE__ */ jsx(Bell, { size: 18 }) },
  { label: "Reportes y estadísticas", href: "/admin/reports", icon: /* @__PURE__ */ jsx(BarChart3, { size: 18 }) },
  { label: "Calendario", href: "/admin/calendar", icon: /* @__PURE__ */ jsx(Calendar, { size: 18 }) },
  { label: "Parámetros / Seguridad", href: "/admin/settings", icon: /* @__PURE__ */ jsx(Settings, { size: 18 }) }
];
const studentNav = [
  { label: "Inicio", href: "/dashboard", icon: /* @__PURE__ */ jsx(LayoutDashboard, { size: 18 }) },
  { label: "Mis cursadas", href: "/dashboard/subjects", icon: /* @__PURE__ */ jsx(BookOpen, { size: 18 }) },
  { label: "Plan de estudios", href: "/dashboard/roadmap", icon: /* @__PURE__ */ jsx(GraduationCap, { size: 18 }) },
  { label: "Historial académico", href: "/dashboard/history", icon: /* @__PURE__ */ jsx(FileText, { size: 18 }) },
  { label: "Inscripción a exámenes", href: "/dashboard/exams", icon: /* @__PURE__ */ jsx(BookMarked, { size: 18 }) },
  { label: "Novedades", href: "/dashboard/announcements", icon: /* @__PURE__ */ jsx(Bell, { size: 18 }) },
  { label: "Datos personales", href: "/dashboard/profile", icon: /* @__PURE__ */ jsx(UserCheck, { size: 18 }) }
];
function Sidebar({ role }) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const navItems = role === "admin" ? adminNav : role === "professor" ? professorNav : studentNav;
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return /* @__PURE__ */ jsxs("aside", { className: "sidebar", children: [
    /* @__PURE__ */ jsxs("div", { className: "siu-sidebar-brand", children: [
      /* @__PURE__ */ jsx("div", { className: "siu-sidebar-logo-box", children: /* @__PURE__ */ jsx("img", { src: LOGO_SRC$1, alt: LOGO_ALT, className: "siu-sidebar-logo", width: 220, height: 120 }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-[11px] font-semibold uppercase leading-snug tracking-wide text-white/90", children: "Sistema de gestión académica" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "siu-sidebar-section-label", children: role === "admin" ? "Menú de administración" : role === "professor" ? "Menú docente" : "Menú de autogestión" }),
    /* @__PURE__ */ jsx("nav", { className: "flex-1 space-y-0.5 py-3", children: navItems.map((item) => {
      const isActive = currentPath === item.href || item.href !== "/admin" && item.href !== "/dashboard" && item.href !== "/professor" && currentPath.startsWith(item.href);
      return /* @__PURE__ */ jsxs(
        Link,
        {
          to: item.href,
          className: `sidebar-link ${isActive ? "active" : ""}`,
          children: [
            item.icon,
            /* @__PURE__ */ jsx("span", { className: "flex-1 leading-snug", children: item.label }),
            isActive && /* @__PURE__ */ jsx(ChevronRight, { size: 14, className: "opacity-70" })
          ]
        },
        item.href
      );
    }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-auto border-t border-[var(--siu-border-light)] bg-white/60 p-3", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: handleLogout,
        className: "sidebar-link w-full text-left text-slate-600 hover:text-red-800",
        children: [
          /* @__PURE__ */ jsx(LogOut, { size: 18 }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Cerrar sesión" })
        ]
      }
    ) })
  ] });
}
const LOGO_SRC = "/logo-isipp.png";
function TopNav({ userName = "Usuario", role }) {
  const [showMenu, setShowMenu] = useState(false);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  const moduleLine = role === "admin" ? "Módulo de administración del sistema" : role === "professor" ? "Módulo docente — cursadas y evaluaciones" : "Módulo de autogestión y consultas académicas";
  return /* @__PURE__ */ jsxs("header", { className: "siu-topnav", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
      /* @__PURE__ */ jsx("img", { src: LOGO_SRC, alt: "", className: "siu-topnav-logo", width: 140, height: 48 }),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-0.5", children: [
        /* @__PURE__ */ jsx("h1", { className: "siu-topnav-title truncate text-sm leading-tight sm:text-base", children: "Instituto Superior de Informática Puerto Piray" }),
        /* @__PURE__ */ jsx("p", { className: "siu-topnav-muted hidden truncate sm:block", children: moduleLine })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: role === "admin" ? "/admin/announcements" : "/dashboard/announcements",
          className: "relative rounded-sm p-2 text-white/90 transition-colors hover:bg-white/10",
          title: "Novedades",
          children: [
            /* @__PURE__ */ jsx(Bell, { size: 20 }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-white ring-2 ring-[var(--isipp-bordo-deep)]",
                "aria-hidden": true
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowMenu(!showMenu),
            className: "flex items-center gap-2 rounded-sm py-1.5 pl-1 pr-2 text-white transition-colors hover:bg-white/10",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-sm border border-white/25 bg-white/15", children: /* @__PURE__ */ jsx(User, { size: 17, className: "text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "hidden text-left md:block", children: [
                /* @__PURE__ */ jsx("div", { className: "max-w-[160px] truncate text-sm font-semibold leading-tight", children: userName }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px] font-medium uppercase tracking-wide text-white/70", children: role === "admin" ? "Administración" : role === "professor" ? "Docente" : "Alumno" })
              ] }),
              /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: "text-white/60" })
            ]
          }
        ),
        showMenu && /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full z-50 mt-1 w-52 border border-[var(--siu-border)] bg-white py-1 shadow-lg", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: role === "admin" ? "/admin/settings" : role === "professor" ? "/professor/settings" : "/dashboard/profile",
              className: "block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-[var(--siu-blue-soft)]",
              onClick: () => setShowMenu(false),
              children: role === "admin" ? "Parámetros y contraseña" : role === "professor" ? "Seguridad y contraseña" : "Mis datos personales"
            }
          ),
          /* @__PURE__ */ jsx("hr", { className: "my-1 border-[var(--siu-border-light)]" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleLogout,
              className: "block w-full px-4 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50",
              children: "Cerrar sesión"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  Sidebar as S,
  TopNav as T
};
