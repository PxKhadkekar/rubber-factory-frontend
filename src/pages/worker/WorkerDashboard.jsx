import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import "./WorkerDashboard.css";

/**
 * Frontend mirror of backend workflow
 * Backend is still the authority
 */
const JOB_STATUS_FLOW = [
  "RECEIVED",
  "GRINDING",
  "SANDBLASTING",
  "AWAITING_ADMIN_APPROVAL",
  "COATING",
  "BONDING",
  "FINISHING",
  "INSPECTION",
  "DISPATCHED",
];

const getNextStatus = (currentStatus) => {
  const index = JOB_STATUS_FLOW.indexOf(currentStatus);
  if (index === -1 || index === JOB_STATUS_FLOW.length - 1) {
    return null;
  }
  return JOB_STATUS_FLOW[index + 1];
};

function WorkerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3000);
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get("/jobs/my");
      setJobs(res.data);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const updateStatus = async (jobId, status) => {
    try {
      await api.patch(`/jobs/${jobId}`, { status });
      showToast("Status updated");
      fetchMyJobs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error"
      );
    }
  };

  const updateMeasurements = async (jobId, measurements) => {
    try {
      await api.patch(`/jobs/${jobId}`, { measurements });
      showToast("Measurements saved");
      fetchMyJobs();
    } catch {
      showToast("Failed to update measurements", "error");
    }
  };

  if (loading) return <p className="dashboard">Loading jobs...</p>;
  if (error) return <p className="dashboard">{error}</p>;

  return (
    <div className="dashboard">
      <h1>My Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs assigned yet.</p>
      ) : (
        <table className="job-table">
          <thead>
            <tr>
              <th>Job No</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Update Status</th>
              <th>Measurements</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => {
              const nextStatus = getNextStatus(job.status);
              const isLocked =
                job.status === "INSPECTION" ||
                job.status === "DISPATCHED";

              return (
                <tr key={job._id}>
                  <td>{job.jobNumber}</td>
                  <td>{job.vehicleNumber}</td>
                  <td>{job.status}</td>

                  {/* STATUS DROPDOWN */}
                  <td>
                    <select
                      value={job.status}
                      disabled={isLocked || !nextStatus}
                      onChange={(e) =>
                        updateStatus(job._id, e.target.value)
                      }
                    >
                      <option value={job.status}>
                        {job.status}
                      </option>

                      {nextStatus && (
                        <option value={nextStatus}>
                          {nextStatus}
                        </option>
                      )}
                    </select>

                    {isLocked && (
                      <p className="locked-text">
                        Job locked after inspection
                      </p>
                    )}
                  </td>

                  {/* MEASUREMENTS */}
                  <td>
                    <div className="measurements">
                      <input
                        disabled={isLocked}
                        type="number"
                        placeholder="Job Length"
                        defaultValue={job.measurements?.jobLength || ""}
                        onBlur={(e) =>
                          updateMeasurements(job._id, {
                            jobLength: Number(e.target.value),
                          })
                        }
                      />

                      <input
                        disabled={isLocked}
                        type="number"
                        placeholder="Old OD"
                        defaultValue={job.measurements?.jobOldOd || ""}
                        onBlur={(e) =>
                          updateMeasurements(job._id, {
                            jobOldOd: Number(e.target.value),
                          })
                        }
                      />

                      <input
                        disabled={isLocked}
                        type="number"
                        placeholder="Required OD"
                        defaultValue={job.measurements?.requiredOd || ""}
                        onBlur={(e) =>
                          updateMeasurements(job._id, {
                            requiredOd: Number(e.target.value),
                          })
                        }
                      />

                      <input
                        disabled={isLocked}
                        type="number"
                        placeholder="Finish OD"
                        defaultValue={job.measurements?.finishOd || ""}
                        onBlur={(e) =>
                          updateMeasurements(job._id, {
                            finishOd: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
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

export default WorkerDashboard;
