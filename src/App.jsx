import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import CreateJob from "./pages/admin/jobs/CreateJob";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-job"
        element={
          <ProtectedRoute role="ADMIN">
            <CreateJob />
          </ProtectedRoute>
        }
      />

      {/* WORKER ROUTES */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute role="WORKER">
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
