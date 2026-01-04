import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import AppLayout from "./layout/AppLayout";
import AdminLayout from "./layout/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateJob from "./pages/admin/jobs/CreateJob";

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import JobDetail from "./pages/JobDetail";

import WorkersPage from "./pages/admin/WorkersPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* App Layout (wraps everything protected) */}
      <Route element={<AppLayout />}>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-job" element={<CreateJob />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />

        </Route>

        {/* WORKER ROUTES */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute role="WORKER">
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />

        {/* JOB DETAIL (shared) */}
        <Route path="/jobs/:id" element={<JobDetail />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
