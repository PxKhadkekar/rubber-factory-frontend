import { useEffect, useState } from "react";
import api from "../../api/axios";
import Toast from "../../components/Toast";
import "./WorkerDashboard.css";

const JOB_STATUS_FLOW = [
  "RECEIVED",
  "GRINDING",
  "SANDBLASTING",
  "COATING",
  "BONDING",
  "FINISHING",
  "INSPECTION",
  "DISPATCHED",
];

const MEASUREMENT_RULES = {
  GRINDING: ["jobLength", "jobOldOd", "jobMsOd", "msWeight"],
  SANDBLASTING: [],
  COATING: ["eboniteOd"],
  BONDING: ["roughOd"],
  FINISHING: ["finishOd"],
  INSPECTION: [],
  DISPATCHED: [],
};

const getNextStatus = (currentStatus) => {
  const index = JOB_STATUS_FLOW.indexOf(currentStatus);
  if (index === -1 || index === JOB_STATUS_FLOW.length - 1) return null;
  return JOB_STATUS_FLOW[index + 1];
};

const isMeasurementEditable = (status, field) => {
  return (MEASUREMENT_RULES[status] || []).includes(field);
};

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
    try {
      await api.patch(`/jobs/${jobId}`, { status });
      showToast("Status updated");
      fetchMyJobs();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Status update failed",
        "error"
      );
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
              const nextStatus = getNextStatus(job.status);
              const isLocked =
                job.waitingForApproval ||
                job.status === "INSPECTION" ||
                job.status === "DISPATCHED";

              return (
                <tr key={job._id}>
                  <td>{job.jobNumber}</td>
                  <td>{job.vehicleNumber}</td>
                  <td>{job.status}</td>

                  {/* STATUS */}
                  <td>
                    <select
                      value={job.status}
                      disabled={isLocked || !nextStatus}
                      onChange={(e) =>
                        updateStatus(job._id, e.target.value)
                      }
                    >
                      <option value={job.status}>{job.status}</option>
                      {nextStatus && (
                        <option value={nextStatus}>{nextStatus}</option>
                      )}
                    </select>

                    {job.waitingForApproval && (
                      <p className="locked-text">
                        Waiting for admin approval
                      </p>
                    )}

                    {!job.waitingForApproval &&
                      (job.status === "INSPECTION" ||
                        job.status === "DISPATCHED") && (
                        <p className="locked-text">
                          Job locked
                        </p>
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
