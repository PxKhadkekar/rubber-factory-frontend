import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUserRole } from "../utils/auth";
import toast from "react-hot-toast";

const AdminActions = ({ job }) => {
  const role = getUserRole();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");

  const isAwaitingApproval = job.status === "AWAITING_ADMIN_APPROVAL";

  // ADMIN ONLY
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
      toast.success("Job approved");
      window.location.reload();
    } catch (err) {
      console.error("JOB APPROVAL FAILED:", err);
      toast.error("Failed to approve job");
    }
  };

  // ===== ASSIGN WORKER =====
  const handleAssignWorker = async () => {
    if (!selectedWorker) return;

    try {
      await api.patch(`/jobs/${job._id}/assign-worker`, {
        workerId: selectedWorker,
      });
      toast.success("Worker assigned");
      window.location.reload();
    } catch (err) {
      console.error("ASSIGN WORKER FAILED:", err);
      toast.error("Failed to assign worker");
    }
  };

  return (
    <div className="w-full">
      {/* ===== APPROVAL SECTION ===== */}
      {isAwaitingApproval ? (
        <div className="mb-4">
          <button 
            onClick={handleApprove}
            className="w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          >
            Approve Job
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400 italic mb-4">Job already approved by administrator.</p>
      )}

      {/* ===== WORKER ASSIGNMENT ===== */}
      {!isAwaitingApproval && (
        <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
          {loading && <p className="text-sm text-gray-500 dark:text-slate-400">Loading workers...</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && !error && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Assign Worker
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select an operator</option>
                  {workers.map((worker) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} ({worker.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignWorker}
                  disabled={!selectedWorker}
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminActions;
