import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const jobsRes = await api.get("/jobs");
      const workersRes = await api.get("/users/workers");

      setJobs(jobsRes.data);
      setWorkers(workersRes.data);
    } catch {
      setError("Failed to load admin data");
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
      showToast("Worker assigned successfully");
      fetchData();
    } catch {
      showToast("Failed to assign worker", "error");
    }
  };

  if (loading) return <p className="dashboard">Loading admin dashboard...</p>;
  if (error) return <p className="dashboard">{error}</p>;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <table className="job-table">
          <thead>
            <tr>
              <th>Job No</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Assigned Worker</th>
              <th>Assign</th>
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
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      assignWorker(job._id, e.target.value)
                    }
                  >
                    <option value="">Select Worker</option>
                    {workers.map((worker) => (
                      <option key={worker._id} value={worker._id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}

export default AdminDashboard;
