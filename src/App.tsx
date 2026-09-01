import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  getCurrentUserContext,
  type CurrentUserContext,
} from './lib/database';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

import GradesPage from './pages/GradesPage';
import TermsPage from './pages/TermsPage';
import SubjectsPage from './pages/SubjectsPage';
import UnitsPage from './pages/UnitsPage';
import LessonPage from './pages/LessonPage';
import GameRuntimePage from './pages/GameRuntimePage';

import ParentDashboard from './pages/dashboards/ParentDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import TenantAdminDashboard from './pages/dashboards/TenantAdminDashboard';
import SuperAdminDashboard from './pages/dashboards/SuperAdminDashboard';

type DashboardState =
  | {
      status: 'loading';
    }
  | {
      status: 'ready';
      context: CurrentUserContext;
    }
  | {
      status: 'error';
      message: string;
    };

function DashboardRouter() {
  const [state, setState] =
    useState<DashboardState>({
      status: 'loading',
    });

  useEffect(() => {
    let cancelled = false;

    async function loadUserContext() {
      try {
        const context =
          await getCurrentUserContext();

        if (!cancelled) {
          setState({
            status: 'ready',
            context,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load the authenticated user.',
          });
        }
      }
    }

    void loadUserContext();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
      >
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-700">
            جاري تحديد لوحة التحكم...
          </p>
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
      >
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-7 shadow-sm">
          <h1 className="text-xl font-bold text-red-700">
            تعذر فتح لوحة التحكم
          </h1>

          <p
            role="alert"
            className="mt-3 text-sm leading-7 text-slate-600"
          >
            {state.message}
          </p>

          <Navigate
            to="/login"
            replace
          />
        </div>
      </main>
    );
  }

  const {
    profile,
    memberships,
    studentProfiles,
    parentStudents,
  } = state.context;

  /*
   * Platform super admin:
   * The authoritative role is profiles.role.
   */
  if (profile.role === 'super_admin') {
    return <SuperAdminDashboard />;
  }

  /*
   * Tenant administrator:
   * The tenant-scoped authority is an active
   * tenant_memberships row with role tenant_admin.
   */
  const hasTenantAdminMembership =
    memberships.some(
      (membership) =>
        membership.status === 'active' &&
        membership.role === 'tenant_admin',
    );

  if (
    profile.role === 'admin' &&
    hasTenantAdminMembership
  ) {
    return <TenantAdminDashboard />;
  }

  /*
   * Student:
   * The student dashboard is only selected when the
   * authenticated profile actually has student profiles.
   */
  if (
    profile.role === 'student' &&
    studentProfiles.length > 0
  ) {
    return <StudentDashboard />;
  }

  /*
   * Parent:
   * The parent dashboard is selected from the parent
   * profile role and its currently visible student links.
   *
   * A parent with zero linked students still gets the
   * parent dashboard so the UI can explain that no
   * students are currently linked.
   */
  if (profile.role === 'parent') {
    void parentStudents;

    return <ParentDashboard />;
  }

  /*
   * Do not guess a role or silently grant access.
   * Unknown/incomplete role configuration goes back to
   * login instead of exposing another dashboard.
   */
  return <Navigate to="/login" replace />;
}

function DashboardRoute() {
  return <DashboardRouter />;
}

function ProtectedCurriculumRoute({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] =
    useState<DashboardState>({
      status: 'loading',
    });

  useEffect(() => {
    let cancelled = false;

    async function checkAuthentication() {
      try {
        const context =
          await getCurrentUserContext();

        if (!cancelled) {
          setState({
            status: 'ready',
            context,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Authentication required.',
          });
        }
      }
    }

    void checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50"
      >
        <p className="text-sm text-slate-500">
          جاري التحقق من تسجيل الدخول...
        </p>
      </main>
    );
  }

  if (state.status === 'error') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Role-based dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardRoute />}
        />

        {/* Curriculum */}
        <Route
          path="/grades"
          element={
            <ProtectedCurriculumRoute>
              <GradesPage />
            </ProtectedCurriculumRoute>
          }
        />

        <Route
          path="/grades/:gradeId/terms"
          element={
            <ProtectedCurriculumRoute>
              <TermsPage />
            </ProtectedCurriculumRoute>
          }
        />

        <Route
          path="/grades/:gradeId/terms/:termId/subjects"
          element={
            <ProtectedCurriculumRoute>
              <SubjectsPage />
            </ProtectedCurriculumRoute>
          }
        />

        <Route
          path="/grades/:gradeId/terms/:termId/subjects/:subjectId/units"
          element={
            <ProtectedCurriculumRoute>
              <UnitsPage />
            </ProtectedCurriculumRoute>
          }
        />

        <Route
          path="/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons"
          element={
            <ProtectedCurriculumRoute>
              <LessonPage />
            </ProtectedCurriculumRoute>
          }
        />

        <Route
          path="/grades/:gradeId/terms/:termId/subjects/:subjectId/units/:unitId/lessons/:lessonId"
          element={
            <ProtectedCurriculumRoute>
              <LessonPage />
            </ProtectedCurriculumRoute>
          }
        />
{/* Game Runtime */}
        <Route
          path="/games/:scope/:gameId"
          element={
            <ProtectedCurriculumRoute>
              <GameRuntimePage />
            </ProtectedCurriculumRoute>
          }
        />
        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;