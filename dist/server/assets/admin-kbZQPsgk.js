import { jsxs, jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
import { S as Sidebar, T as TopNav } from "./TopNav-CrpTHXc9.js";
import { s as supabase } from "./router-Cgpt3s8a.js";
import { useState, useEffect } from "react";
import "lucide-react";
import "@supabase/supabase-js";
import "chart.js";
function AdminLayout() {
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
    /* @__PURE__ */ jsx(Sidebar, { role: "admin" }),
    /* @__PURE__ */ jsxs("div", { className: "ml-64 flex min-h-screen flex-1 flex-col", children: [
      /* @__PURE__ */ jsx(TopNav, { userName, role: "admin" }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-auto border-t border-[var(--siu-border-light)] p-6 shadow-inner", children: /* @__PURE__ */ jsx(Outlet, {}) })
    ] })
  ] });
}
export {
  AdminLayout as component
};
