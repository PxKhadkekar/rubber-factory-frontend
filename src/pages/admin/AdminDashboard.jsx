import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import { getRole } from "../../utils/getRole";
import "./AdminDashboard.css";

function AdminDashboard() {
  const role = getRole();

  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [newJob, setNewJob] = useState({
    jobNumber: "",
    vehicleNumber: "",
    rubberType: "",
    punchNumber: 1,
    processType: "GRINDING",
    companyName: "",
    price: "",
  });

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

  /* -------------------- CREATE JOB -------------------- */
  const handleJobChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const createJob = async () => {
    try {
      await api.post("/jobs", newJob);
      showToast("Job created, awaiting approval");
      setNewJob({
        jobNumber: "",
        vehicleNumber: "",
        rubberType: "",
        punchNumber: 1,
        processType: "GRINDING",
        companyName: "",
        price: "",
      });
      fetchJobs();
    } catch (err) {
      showToast(err.response?.data?.message || "Job creation failed", "error");
    }
  };

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

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p style={{ fontWeight: "bold", marginBottom: "16px" }}>
        Role: {role}
      </p>

      {/* ================= CREATE JOB ================= */}
      <section className="admin-section">
        <h2>Create Job</h2>

        <div className="create-job-form">
          <input name="jobNumber" placeholder="Job Number" value={newJob.jobNumber} onChange={handleJobChange} />
          <input name="vehicleNumber" placeholder="Vehicle Number" value={newJob.vehicleNumber} onChange={handleJobChange} />
          <input name="rubberType" placeholder="Rubber Type" value={newJob.rubberType} onChange={handleJobChange} />
          <input name="companyName" placeholder="Company Name" value={newJob.companyName} onChange={handleJobChange} />
          <input name="price" type="number" placeholder="Price" value={newJob.price} onChange={handleJobChange} />
          <input name="punchNumber" type="number" placeholder="Punch No" value={newJob.punchNumber} onChange={handleJobChange} />

          <select name="processType" value={newJob.processType} onChange={handleJobChange}>
            <option value="GRINDING">GRINDING</option>
            <option value="COATING">COATING</option>
          </select>

          <button onClick={createJob}>Create Job</button>
        </div>
      </section>

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
                    <button onClick={() => approveJob(job._id)}>Approve</button>
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
