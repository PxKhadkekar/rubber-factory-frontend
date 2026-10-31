import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import workerJobStatusFlow from "../../constants/workerJobStatusFlow";
import { socket } from "../../api/socket";
import { getUserId } from "../../utils/auth";

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

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const workerId = getUserId();

  const fetchMyJobs = async () => {
    try {
      const res = await api.get(`/jobs/my?page=${page}&limit=${limit}&search=${searchQuery}`);
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, refreshTrigger]);

  useEffect(() => {
    socket.connect();

    socket.on("jobAssigned", (data) => {
      if (data.workerId === workerId) {
        toast.success(`New Job Assigned: ${data.job.jobNumber}`);
        setRefreshTrigger((prev) => prev + 1);
      }
    });

    socket.on("jobUpdated", (job) => {
      // Refresh if it's our job that was updated (maybe by admin or other device)
      if (job.assignedWorker === workerId) {
        setRefreshTrigger((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("jobAssigned");
      socket.off("jobUpdated");
      socket.disconnect();
    };
  }, [workerId]);

  const updateStatus = async (jobId, status) => {
    if (!status) return;
    try {
      await api.patch(`/jobs/${jobId}`, { status });
      toast.success("Status updated");
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  const updateMeasurements = async (jobId, measurements) => {
    try {
      await api.patch(`/jobs/${jobId}`, { measurements });
      toast.success("Measurements saved");
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Measurement update failed");
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Assigned Jobs</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            View your operational queue, transition workflow phases, and log dimensional metrics.
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <input 
            type="text" 
            placeholder="Search my jobs..." 
            className="block w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 sm:text-sm px-4 py-2.5 transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl p-12 text-center border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center transition-colors">
          <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You have no active assignments</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-sm">When the administrator assigns a job to you, it will appear right here in your pipeline.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Job No</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Next Step</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Measurements</th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
                {jobs.map((job) => {
                  if (job.status === "AWAITING_ADMIN_APPROVAL") return null;

                  const allowedNextStatuses = workerJobStatusFlow[job.status] || [];
                  const isLocked = job.status === "INSPECTION" || job.status === "DISPATCHED";

                  return (
                    <tr key={job._id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-all duration-150 group">
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-slate-100">{job.jobNumber}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{job.vehicleNumber}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                          {job.status}
                        </span>
                      </td>

                      {/* STATUS TRANSITION */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        {!isLocked && allowedNextStatuses.length > 0 ? (
                          <select
                            defaultValue=""
                            onChange={(e) => updateStatus(job._id, e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-blue-300 dark:border-blue-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors font-semibold text-blue-800 dark:text-blue-300 cursor-pointer"
                          >
                            <option value="" disabled>Move to next stage</option>
                            {allowedNextStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            Locked
                          </span>
                        )}
                      </td>

                      {/* MEASUREMENTS */}
                      <td className="px-6 py-5 text-sm">
                        <div className="grid grid-cols-2 gap-3 min-w-[240px]">
                          {[
                            { key: "jobLength", label: "Length" },
                            { key: "jobOldOd", label: "Old OD" },
                            { key: "jobMsOd", label: "MS OD" },
                            { key: "msWeight", label: "MS Wt" },
                            { key: "eboniteOd", label: "Ebonite OD" },
                            { key: "roughOd", label: "Rough OD" },
                            { key: "finishOd", label: "Finish OD" },
                          ].map(({ key, label }) => {
                            const isEditable = !isLocked && isMeasurementEditable(job.status, key);
                            return (
                              <div key={key} className="flex flex-col">
                                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">{label}</label>
                                <input
                                  type="number"
                                  placeholder="-"
                                  disabled={!isEditable}
                                  defaultValue={job.measurements?.[key] || ""}
                                  onBlur={(e) => updateMeasurements(job._id, { [key]: Number(e.target.value) })}
                                  className={`block w-full text-sm rounded-lg border transition-all duration-200 px-3 py-1.5 focus:outline-none ${
                                    !isEditable 
                                      ? 'bg-gray-100 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed' 
                                      : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-300 shadow-sm'
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {!isLocked && (MEASUREMENT_RULES[job.status] || []).length === 0 && (
                          <p className="mt-3 text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 inline-block px-2 py-1 rounded border border-gray-100 dark:border-slate-700">No measurements required</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-10">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm font-bold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
}

export default WorkerDashboard;
