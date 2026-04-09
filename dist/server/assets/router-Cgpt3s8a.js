import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, createContext, useContext } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, LineElement, PointElement, Filler } from "chart.js";
const ToastContext = createContext({ showToast: () => {
} });
function useToast() {
  return useContext(ToastContext);
}
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4e3);
  }, []);
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: { showToast }, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-[100] space-y-2", children: toasts.map((toast) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex min-w-[280px] items-center gap-3 border border-[var(--siu-border)] bg-white px-4 py-3 text-sm text-slate-800 shadow-lg ${toast.type === "success" ? "border-l-4 border-l-emerald-600" : toast.type === "error" ? "border-l-4 border-l-red-600" : "border-l-4 border-l-[var(--siu-blue)]"}`,
        style: { borderRadius: "2px" },
        children: [
          toast.type === "success" && /* @__PURE__ */ jsx(CheckCircle, { size: 18, className: "shrink-0 text-emerald-600" }),
          toast.type === "error" && /* @__PURE__ */ jsx(XCircle, { size: 18, className: "shrink-0 text-red-600" }),
          toast.type === "info" && /* @__PURE__ */ jsx(AlertCircle, { size: 18, className: "shrink-0 text-[var(--siu-blue)]" }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 font-medium leading-snug", children: toast.message }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setToasts((prev) => prev.filter((t) => t.id !== toast.id)),
              className: "shrink-0 text-slate-400 hover:text-slate-700",
              "aria-label": "Cerrar aviso",
              children: /* @__PURE__ */ jsx(X, { size: 16 })
            }
          )
        ]
      },
      toast.id
    )) })
  ] });
}
const Route$A = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ISIPP Puerto Piray · Gestión académica" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap"
      }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(ToastProvider, { children }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$z = () => import("./reset-password-BNvcjqmO.js");
const Route$z = createFileRoute("/reset-password")({
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const supabaseUrl = "https://nubtgvweebyqmjrshtnz.supabase.co";
const supabaseAnonKey = "sb_publishable_YNv-FVhJ8BguGYqONHMs8w_k7rO9T--";
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
const $$splitComponentImporter$y = () => import("./professor-D_FgRNAp.js");
const Route$y = createFileRoute("/professor")({
  beforeLoad: async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw redirect({
      to: "/login"
    });
    const {
      data: profile
    } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const r = profile?.role;
    const ok = r === "profesor" || r === "professor" || r === "admin" || r === "operador" || r === "operator";
    if (!ok) {
      throw redirect({
        to: "/dashboard"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./login-Voo8MiR4.js");
const Route$x = createFileRoute("/login")({
  beforeLoad: async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (user) throw redirect({
      to: "/"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const LEGACY = {
  student: "alumno",
  professor: "profesor",
  admin: "admin",
  operator: "operador"
};
function normalizeDbRole(role) {
  if (!role) return void 0;
  if (role === "admin" || role === "profesor" || role === "alumno" || role === "operador") return role;
  return LEGACY[role];
}
function homePathForRole(role) {
  const r = normalizeDbRole(role);
  if (r === "admin" || r === "operador") return "/admin";
  if (r === "profesor") return "/professor";
  return "/dashboard";
}
function isStaffRole(role) {
  const r = normalizeDbRole(role);
  return r === "admin" || r === "operador";
}
const $$splitComponentImporter$w = () => import("./dashboard-DjeYoRBr.js");
const Route$w = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw redirect({
      to: "/login"
    });
    const {
      data: profile
    } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const dest = homePathForRole(profile?.role);
    if (dest !== "/dashboard") throw redirect({
      to: dest
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./admin-kbZQPsgk.js");
const Route$v = createFileRoute("/admin")({
  beforeLoad: async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw redirect({
      to: "/login"
    });
    const {
      data: profile
    } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!isStaffRole(profile?.role)) throw redirect({
      to: homePathForRole(profile?.role)
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./index-BTU5dmpx.js");
const Route$u = createFileRoute("/")({
  beforeLoad: async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) throw redirect({
      to: "/login"
    });
    const {
      data: profile
    } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    throw redirect({
      to: homePathForRole(profile?.role)
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./index-DbKnkxvm.js");
const Route$t = createFileRoute("/professor/")({
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./index-euvmZWqj.js");
const Route$s = createFileRoute("/dashboard/")({
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./index-BWF0qtwO.js");
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
const Route$r = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./subjects-34pvrcMN.js");
const Route$q = createFileRoute("/professor/subjects")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./settings-DSlIbCIB.js");
const Route$p = createFileRoute("/professor/settings")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./materials-BQCcAOBQ.js");
const Route$o = createFileRoute("/professor/materials")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./grades-7HkDZIey.js");
const Route$n = createFileRoute("/professor/grades")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./attendance-yxmfs9u3.js");
const Route$m = createFileRoute("/professor/attendance")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./subjects-CeSx6uPh.js");
const Route$l = createFileRoute("/dashboard/subjects")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./roadmap-BoDGnKRA.js");
const Route$k = createFileRoute("/dashboard/roadmap")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./profile-uWQ5eUnp.js");
const Route$j = createFileRoute("/dashboard/profile")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./history-sxc3v17j.js");
const Route$i = createFileRoute("/dashboard/history")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./exams-C47p7Z_w.js");
const Route$h = createFileRoute("/dashboard/exams")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./certificates-BwN3LCYF.js");
const Route$g = createFileRoute("/dashboard/certificates")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./announcements-CuLfh1Dv.js");
const Route$f = createFileRoute("/dashboard/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./subjects-BFrC4sZS.js");
const Route$e = createFileRoute("/admin/subjects")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./students-Dwonf0oe.js");
const Route$d = createFileRoute("/admin/students")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./settings-BDZgAFPu.js");
const Route$c = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./reports-y-Px_bJB.js");
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);
const Route$b = createFileRoute("/admin/reports")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./programs-CWj4u987.js");
const Route$a = createFileRoute("/admin/programs")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./professors-DxS0_pE8.js");
const Route$9 = createFileRoute("/admin/professors")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./grades-CGG9Vhv3.js");
const Route$8 = createFileRoute("/admin/grades")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./final-exams-CC_K3GCx.js");
const Route$7 = createFileRoute("/admin/final-exams")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./exam-records-DG7-tals.js");
const Route$6 = createFileRoute("/admin/exam-records")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./enrollments-BmXgC_0E.js");
const Route$5 = createFileRoute("/admin/enrollments")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./correlatives-Cy5anAaw.js");
const Route$4 = createFileRoute("/admin/correlatives")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./calendar-mcNBL6yQ.js");
const Route$3 = createFileRoute("/admin/calendar")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./attendance-CHXvwzvh.js");
const Route$2 = createFileRoute("/admin/attendance")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./announcements-DR9EzE8D.js");
const Route$1 = createFileRoute("/admin/announcements")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./student-record._id-BahrqJUN.js");
const Route = createFileRoute("/admin/student-record/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const ResetPasswordRoute = Route$z.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$A
});
const ProfessorRoute = Route$y.update({
  id: "/professor",
  path: "/professor",
  getParentRoute: () => Route$A
});
const LoginRoute = Route$x.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$A
});
const DashboardRoute = Route$w.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$A
});
const AdminRoute = Route$v.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$A
});
const IndexRoute = Route$u.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$A
});
const ProfessorIndexRoute = Route$t.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProfessorRoute
});
const DashboardIndexRoute = Route$s.update({
  id: "/",
  path: "/",
  getParentRoute: () => DashboardRoute
});
const AdminIndexRoute = Route$r.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const ProfessorSubjectsRoute = Route$q.update({
  id: "/subjects",
  path: "/subjects",
  getParentRoute: () => ProfessorRoute
});
const ProfessorSettingsRoute = Route$p.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => ProfessorRoute
});
const ProfessorMaterialsRoute = Route$o.update({
  id: "/materials",
  path: "/materials",
  getParentRoute: () => ProfessorRoute
});
const ProfessorGradesRoute = Route$n.update({
  id: "/grades",
  path: "/grades",
  getParentRoute: () => ProfessorRoute
});
const ProfessorAttendanceRoute = Route$m.update({
  id: "/attendance",
  path: "/attendance",
  getParentRoute: () => ProfessorRoute
});
const DashboardSubjectsRoute = Route$l.update({
  id: "/subjects",
  path: "/subjects",
  getParentRoute: () => DashboardRoute
});
const DashboardRoadmapRoute = Route$k.update({
  id: "/roadmap",
  path: "/roadmap",
  getParentRoute: () => DashboardRoute
});
const DashboardProfileRoute = Route$j.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => DashboardRoute
});
const DashboardHistoryRoute = Route$i.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => DashboardRoute
});
const DashboardExamsRoute = Route$h.update({
  id: "/exams",
  path: "/exams",
  getParentRoute: () => DashboardRoute
});
const DashboardCertificatesRoute = Route$g.update({
  id: "/certificates",
  path: "/certificates",
  getParentRoute: () => DashboardRoute
});
const DashboardAnnouncementsRoute = Route$f.update({
  id: "/announcements",
  path: "/announcements",
  getParentRoute: () => DashboardRoute
});
const AdminSubjectsRoute = Route$e.update({
  id: "/subjects",
  path: "/subjects",
  getParentRoute: () => AdminRoute
});
const AdminStudentsRoute = Route$d.update({
  id: "/students",
  path: "/students",
  getParentRoute: () => AdminRoute
});
const AdminSettingsRoute = Route$c.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AdminRoute
});
const AdminReportsRoute = Route$b.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => AdminRoute
});
const AdminProgramsRoute = Route$a.update({
  id: "/programs",
  path: "/programs",
  getParentRoute: () => AdminRoute
});
const AdminProfessorsRoute = Route$9.update({
  id: "/professors",
  path: "/professors",
  getParentRoute: () => AdminRoute
});
const AdminGradesRoute = Route$8.update({
  id: "/grades",
  path: "/grades",
  getParentRoute: () => AdminRoute
});
const AdminFinalExamsRoute = Route$7.update({
  id: "/final-exams",
  path: "/final-exams",
  getParentRoute: () => AdminRoute
});
const AdminExamRecordsRoute = Route$6.update({
  id: "/exam-records",
  path: "/exam-records",
  getParentRoute: () => AdminRoute
});
const AdminEnrollmentsRoute = Route$5.update({
  id: "/enrollments",
  path: "/enrollments",
  getParentRoute: () => AdminRoute
});
const AdminCorrelativesRoute = Route$4.update({
  id: "/correlatives",
  path: "/correlatives",
  getParentRoute: () => AdminRoute
});
const AdminCalendarRoute = Route$3.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => AdminRoute
});
const AdminAttendanceRoute = Route$2.update({
  id: "/attendance",
  path: "/attendance",
  getParentRoute: () => AdminRoute
});
const AdminAnnouncementsRoute = Route$1.update({
  id: "/announcements",
  path: "/announcements",
  getParentRoute: () => AdminRoute
});
const AdminStudentRecordIdRoute = Route.update({
  id: "/student-record/$id",
  path: "/student-record/$id",
  getParentRoute: () => AdminRoute
});
const AdminRouteChildren = {
  AdminAnnouncementsRoute,
  AdminAttendanceRoute,
  AdminCalendarRoute,
  AdminCorrelativesRoute,
  AdminEnrollmentsRoute,
  AdminExamRecordsRoute,
  AdminFinalExamsRoute,
  AdminGradesRoute,
  AdminProfessorsRoute,
  AdminProgramsRoute,
  AdminReportsRoute,
  AdminSettingsRoute,
  AdminStudentsRoute,
  AdminSubjectsRoute,
  AdminIndexRoute,
  AdminStudentRecordIdRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const DashboardRouteChildren = {
  DashboardAnnouncementsRoute,
  DashboardCertificatesRoute,
  DashboardExamsRoute,
  DashboardHistoryRoute,
  DashboardProfileRoute,
  DashboardRoadmapRoute,
  DashboardSubjectsRoute,
  DashboardIndexRoute
};
const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren
);
const ProfessorRouteChildren = {
  ProfessorAttendanceRoute,
  ProfessorGradesRoute,
  ProfessorMaterialsRoute,
  ProfessorSettingsRoute,
  ProfessorSubjectsRoute,
  ProfessorIndexRoute
};
const ProfessorRouteWithChildren = ProfessorRoute._addFileChildren(
  ProfessorRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  DashboardRoute: DashboardRouteWithChildren,
  LoginRoute,
  ProfessorRoute: ProfessorRouteWithChildren,
  ResetPasswordRoute
};
const routeTree = Route$A._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r,
  supabase as s,
  useToast as u
};
