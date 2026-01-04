import { Outlet, Link, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: "12px 20px",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        Factory Admin Panel
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "10px 20px",
          backgroundColor: "#e5e7eb",
        }}
      >
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/create-job">Create Job</Link>
        <Link to="/admin/workers">Workers</Link>
        <Link to="/admin/audit-logs">Audit Logs</Link>

        <button
          onClick={handleLogout}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}
