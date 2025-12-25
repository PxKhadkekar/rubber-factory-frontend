import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const approveJob = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      showToast("Job approved");
      fetchJobs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Approval failed",
        "error"
      );
    }
  };

  if (loading) return <p className="dashboard">Loading jobs...</p>;

  const needsApproval = jobs.filter(
    (job) => job.status === "AWAITING_ADMIN_APPROVAL"
  );

  const inProgress = jobs.filter(
    (job) => job.status !== "AWAITING_ADMIN_APPROVAL"
  );

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* ================= NEEDS APPROVAL ================= */}
      <section className="admin-section">
        <h2>Needs Approval</h2>

        {needsApproval.length === 0 ? (
          <p>No jobs pending approval.</p>
        ) : (
          <table className="job-table">
            <thead>
              <tr>
                <th>Job No</th>
                <th>Company</th>
                <th>Vehicle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {needsApproval.map((job) => (
                <tr key={job._id}>
                  <td>{job.jobNumber}</td>
                  <td>{job.companyName}</td>
                  <td>{job.vehicleNumber}</td>
                  <td>
                    <button
                      className="approve-btn"
                      onClick={() => approveJob(job._id)}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ================= IN PROGRESS ================= */}
      <section className="admin-section">
        <h2>In Progress</h2>

        {inProgress.length === 0 ? (
          <p>No active jobs.</p>
        ) : (
          <table className="job-table">
            <thead>
              <tr>
                <th>Job No</th>
                <th>Status</th>
                <th>Worker</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {inProgress.map((job) => (
                <tr key={job._id}>
                  <td>{job.jobNumber}</td>
                  <td>{job.status}</td>
                  <td>
                    {job.assignedWorker
                      ? job.assignedWorker.name
                      : "Unassigned"}
                  </td>
                  <td>{job.companyName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}

export default AdminDashboard;
