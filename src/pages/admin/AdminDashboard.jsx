import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const [jobsRes, workersRes] = await Promise.all([
        api.get("/jobs"),
        api.get("/users/workers"),
      ]);
      setJobs(jobsRes.data);
      setWorkers(workersRes.data);
    } catch {
      showToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignWorker = async (jobId, workerId) => {
    if (!workerId) return;

    try {
      await api.patch(`/jobs/${jobId}/assign`, { workerId });
      showToast("Worker assigned");
      fetchData();
    } catch {
      showToast("Assignment failed", "error");
    }
  };

  const approveJob = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      showToast("Job approved");
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Approval failed",
        "error"
      );
    }
  };

  if (loading) return <p className="dashboard">Loading admin dashboard...</p>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <table className="job-table">
        <thead>
          <tr>
            <th>Job No</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Worker</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job._id}>
              <td>{job.jobNumber}</td>
              <td>{job.vehicleNumber}</td>
              <td>{job.status}</td>
              <td>
                {job.assignedWorker
                  ? job.assignedWorker.name
                  : "Not Assigned"}
              </td>
              <td>
                {job.waitingForApproval ? (
                  <button onClick={() => approveJob(job._id)}>
                    Approve
                  </button>
                ) : (
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      assignWorker(job._id, e.target.value)
                    }
                  >
                    <option value="">Assign Worker</option>
                    {workers.map((worker) => (
                      <option key={worker._id} value={worker._id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}

export default AdminDashboard;
