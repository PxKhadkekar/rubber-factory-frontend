import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import workerJobStatusFlow from "../../constants/workerJobStatusFlow";
import "./WorkerDashboard.css";

const MEASUREMENT_RULES = {
  GRINDING: ["jobLength", "jobOldOd", "jobMsOd", "msWeight"],
  SANDBLASTING: [],
  COATING: ["eboniteOd"],
  BONDING: ["roughOd"],
  FINISHING: ["finishOd"],
  INSPECTION: [],
  DISPATCHED: [],
};

const isMeasurementEditable = (status, field) =>
  (MEASUREMENT_RULES[status] || []).includes(field);

function WorkerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get("/jobs/my");
      setJobs(res.data);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const updateStatus = async (jobId, status) => {
    if (!status) return;
    try {
      await api.patch(`/jobs/${jobId}`, { status });
      showToast("Status updated");
      fetchMyJobs();
    } catch (err) {
      showToast(err.response?.data?.message || "Status update failed", "error");
    }
  };

  const updateMeasurements = async (jobId, measurements) => {
    try {
      await api.patch(`/jobs/${jobId}`, { measurements });
      showToast("Measurements saved");
      fetchMyJobs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Measurement update failed",
        "error"
      );
    }
  };

  if (loading) return <p className="dashboard">Loading jobs...</p>;

  return (
    <div className="dashboard">
      <h1>My Jobs</h1>

      {jobs.length === 0 ? (
        <p>No jobs assigned.</p>
      ) : (
        <table className="job-table">
          <thead>
            <tr>
              <th>Job No</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Next Step</th>
              <th>Measurements</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => {
              // HARD BLOCK: Worker never sees admin-pending jobs
              if (job.status === "AWAITING_ADMIN_APPROVAL") return null;

              const allowedNextStatuses =
                workerJobStatusFlow[job.status] || [];

              const isLocked =
                job.status === "INSPECTION" ||
                job.status === "DISPATCHED";

              return (
                <tr key={job._id}>
                  <td>{job.jobNumber}</td>
                  <td>{job.vehicleNumber}</td>
                  <td>
                    <span className={`status-badge ${job.status}`}>
                      {job.status}
                    </span>
                  </td>

                  {/* STATUS TRANSITION */}
                  <td>
                    {!isLocked && allowedNextStatuses.length > 0 ? (
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          updateStatus(job._id, e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Move to next stage
                        </option>
                        {allowedNextStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="locked-text">Locked</span>
                    )}
                  </td>

                  {/* MEASUREMENTS */}
                  <td>
                    <div className="measurements">
                      {[
                        { key: "jobLength", label: "Job Length" },
                        { key: "jobOldOd", label: "Old OD" },
                        { key: "jobMsOd", label: "MS OD" },
                        { key: "msWeight", label: "MS Weight" },
                        { key: "eboniteOd", label: "Ebonite OD" },
                        { key: "roughOd", label: "Rubber Rough OD" },
                        { key: "finishOd", label: "Finish OD" },
                      ].map(({ key, label }) => (
                        <input
                          key={key}
                          type="number"
                          placeholder={label}
                          disabled={
                            isLocked ||
                            !isMeasurementEditable(job.status, key)
                          }
                          defaultValue={job.measurements?.[key] || ""}
                          onBlur={(e) =>
                            updateMeasurements(job._id, {
                              [key]: Number(e.target.value),
                            })
                          }
                        />
                      ))}
                    </div>

                    {!isLocked &&
                      (MEASUREMENT_RULES[job.status] || []).length === 0 && (
                        <p className="locked-text">
                          No measurements allowed in this phase
                        </p>
                      )}
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
