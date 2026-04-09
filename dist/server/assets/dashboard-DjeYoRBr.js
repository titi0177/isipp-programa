import { jsx, jsxs } from "react/jsx-runtime";
import { useRouterState, Link, Outlet } from "@tanstack/react-router";
import { S as Sidebar, T as TopNav } from "./TopNav-CrpTHXc9.js";
import { LayoutDashboard, BookOpen, Map, Bell, User } from "lucide-react";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { useState, useEffect } from "react";
import "@supabase/supabase-js";
import "chart.js";
const items = [
  { to: "/dashboard", label: "Inicio", icon: LayoutDashboard, match: (p) => p === "/dashboard" },
  { to: "/dashboard/subjects", label: "Cursadas", icon: BookOpen, match: (p) => p.startsWith("/dashboard/subjects") },
  { to: "/dashboard/roadmap", label: "Plan", icon: Map, match: (p) => p.startsWith("/dashboard/roadmap") },
  { to: "/dashboard/announcements", label: "Avisos", icon: Bell, match: (p) => p.startsWith("/dashboard/announcements") },
  { to: "/dashboard/profile", label: "Perfil", icon: User, match: (p) => p.startsWith("/dashboard/profile") }
];
function StudentBottomNav() {
  const { location } = useRouterState();
  const path = location.pathname;
  return /* @__PURE__ */ jsx(
    "nav",
    {
      className: "fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--siu-border-light)] bg-white/95 px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden",
      "aria-label": "Navegación principal",
      children: items.map(({ to, label, icon: Icon, match }) => {
        const active = match(path);
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to,
            className: `flex flex-1 flex-col items-center gap-0.5 rounded-sm px-1 py-1.5 text-[10px] font-semibold ${active ? "text-[var(--isipp-bordo-deep)]" : "text-slate-500"}`,
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", strokeWidth: active ? 2.25 : 2 }),
              /* @__PURE__ */ jsx("span", { className: "leading-none", children: label })
            ]
          },
          to
        );
      })
    }
  );
}
function DashboardLayout() {
  const [userName, setUserName] = useState("");
  useEffect(() => {
    supabase.auth.getUser().then(({
      data: {
        user
      }
    }) => {
      if (user) {
        supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({
          data
        }) => setUserName(data?.full_name || user.email || ""));
      }
    });
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen siu-main-bg", children: [
    /* @__PURE__ */ jsx(Sidebar, { role: "student" }),
    /* @__PURE__ */ jsxs("div", { className: "ml-64 flex min-h-screen flex-1 flex-col", children: [
      /* @__PURE__ */ jsx(TopNav, { userName, role: "student" }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-auto border-t border-[var(--siu-border-light)] p-6 pb-24 shadow-inner md:pb-6", children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(StudentBottomNav, {})
    ] })
  ] });
}
export {
  DashboardLayout as component
};
