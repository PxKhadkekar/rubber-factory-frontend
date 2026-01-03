import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUserRole } from "../utils/auth";

const AdminActions = ({ job }) => {
  const role = getUserRole();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");

  const isAwaitingApproval = job.status === "AWAITING_ADMIN_APPROVAL";

  // 🔒 ADMIN ONLY
  if (role !== "ADMIN") {
    return null;
  }

  // ===== FETCH WORKERS =====
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await api.get("/users/workers");
        setWorkers(res.data);
      } catch (err) {
        console.error("FETCH WORKERS ERROR:", err);
        setError("Failed to load workers");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // ===== APPROVE JOB =====
  const handleApprove = async () => {
    const confirmed = window.confirm(
      "Approve this job and move it to the next stage?"
    );

    if (!confirmed) return;

    try {
      await api.patch(`/jobs/${job._id}/approve`);
      window.location.reload(); // simple, reliable
    } catch (err) {
      console.error("JOB APPROVAL FAILED:", err);
      alert("Failed to approve job");
    }
  };

  // ===== ASSIGN WORKER =====
  const handleAssignWorker = async () => {
    if (!selectedWorker) return;

    try {
      await api.patch(`/jobs/${job._id}/assign-worker`, {
        workerId: selectedWorker,
      });

      window.location.reload();
    } catch (err) {
      console.error("ASSIGN WORKER FAILED:", err);
      alert("Failed to assign worker");
    }
  };

  return (
    <div className="section-card">
      <h3>Admin Actions</h3>

      {/* ===== APPROVAL SECTION ===== */}
      {isAwaitingApproval ? (
        <div style={{ marginBottom: "16px" }}>
          <button onClick={handleApprove}>
            Approve Job
          </button>
        </div>
      ) : (
        <p className="empty-text">Job already approved.</p>
      )}

      {/* ===== WORKER ASSIGNMENT (ONLY AFTER APPROVAL) ===== */}
      {!isAwaitingApproval && (
        <>
          {loading && <p>Loading workers...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && (
            <div style={{ marginTop: "12px" }}>
              <label>
                Assign Worker:
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  style={{ marginLeft: "8px" }}
                >
                  <option value="">Select worker</option>
                  {workers.map((worker) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
              </label>

              <div style={{ marginTop: "8px" }}>
                <button
                  onClick={handleAssignWorker}
                  disabled={!selectedWorker}
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminActions;
