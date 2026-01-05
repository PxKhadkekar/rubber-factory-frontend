import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import { getRole } from "../../utils/getRole";
import "./AdminDashboard.css";

function AdminDashboard() {
  const role = getRole();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  /* -------------------- TOAST -------------------- */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  /* -------------------- FETCH DATA -------------------- */
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

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/users/workers");
      setWorkers(res.data);
    } catch {
      showToast("Failed to load workers", "error");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchWorkers();
  }, []);

  /* -------------------- APPROVE JOB -------------------- */
  const approveJob = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      showToast("Job approved");
      fetchJobs();
    } catch (err) {
      showToast(err.response?.data?.message || "Approval failed", "error");
    }
  };

  /* -------------------- ASSIGN WORKER -------------------- */
  const assignWorker = async (jobId, workerId) => {
    try {
      await api.patch(`/jobs/${jobId}/assign`, { workerId });
      showToast("Worker assigned");
      fetchJobs();
    } catch {
      showToast("Worker assignment failed", "error");
    }
  };

  if (loading) return <p className="dashboard">Loading jobs...</p>;

  const needsApproval = jobs.filter(
    (job) => job.status === "AWAITING_ADMIN_APPROVAL"
  );

  const inProgress = jobs.filter(
    (job) => job.status !== "AWAITING_ADMIN_APPROVAL"
  );

  const JobLink = ({ job }) => (
    <button
      className="link-button"
      onClick={() => navigate(`/jobs/${job._id}`)}
    >
      {job.jobNumber}
    </button>
  );

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p style={{ fontWeight: "bold", marginBottom: "16px" }}>
        Role: {role}
      </p>

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
                  <td><JobLink job={job} /></td>
                  <td>{job.companyName}</td>
                  <td>{job.vehicleNumber}</td>
                  <td>
                    <button onClick={() => approveJob(job._id)}>
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
                  <td><JobLink job={job} /></td>
                  <td>
  <div className="status-wrapper">
    <span
      className={`status-badge ${
        job.status === "AWAITING_ADMIN_APPROVAL"
          ? "status-pending"
          : job.status === "DISPATCHED"
          ? "status-completed"
          : "status-in-progress"
      }`}
    />
    {job.status}
  </div>
</td>

                  <td>
                    {job.assignedWorker ? (
                      job.assignedWorker.name
                    ) : (
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          assignWorker(job._id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Assign Worker
                        </option>
                        {workers.map((w) => (
                          <option key={w._id} value={w._id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    )}
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
