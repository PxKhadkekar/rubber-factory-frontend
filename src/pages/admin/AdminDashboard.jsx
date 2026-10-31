import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { getRole } from "../../utils/getRole";
import { socket } from "../../api/socket";

function AdminDashboard() {
  const role = getRole();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* -------------------- FETCH DATA -------------------- */
  const fetchJobs = async () => {
    try {
      const res = await api.get(`/jobs?page=${page}&limit=${limit}&search=${searchQuery}`);
      setJobs(res.data.jobs || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/users/workers");
      setWorkers(res.data);
    } catch {
      toast.error("Failed to load workers");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, refreshTrigger]);

  useEffect(() => {
    socket.connect();

    socket.on("jobCreated", (job) => {
      toast.success(`New Job Created: ${job.jobNumber}`);
      setRefreshTrigger((prev) => prev + 1);
    });

    socket.on("jobUpdated", (job) => {
      toast.success(`Job Updated: ${job.jobNumber}`);
      setRefreshTrigger((prev) => prev + 1);
    });

    socket.on("jobApproved", () => {
      setRefreshTrigger((prev) => prev + 1);
    });

    socket.on("jobAssigned", () => {
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      socket.off("jobCreated");
      socket.off("jobUpdated");
      socket.off("jobApproved");
      socket.off("jobAssigned");
      socket.disconnect();
    };
  }, []);

  /* -------------------- APPROVE JOB -------------------- */
  const approveJob = async (jobId) => {
    try {
      await api.patch(`/jobs/${jobId}/approve`);
      toast.success("Job approved");
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  /* -------------------- ASSIGN WORKER -------------------- */
  const assignWorker = async (jobId, workerId) => {
    try {
      await api.patch(`/jobs/${jobId}/assign`, { workerId });
      toast.success("Worker assigned");
      fetchJobs();
    } catch {
      toast.error("Worker assignment failed");
    }
  };

  if (loading && page === 1) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Loading dashboard...</p>
    </div>
  );

  const needsApproval = jobs.filter(
    (job) => job.status === "AWAITING_ADMIN_APPROVAL"
  );

  const inProgress = jobs.filter(
    (job) => job.status !== "AWAITING_ADMIN_APPROVAL"
  );

  const JobLink = ({ job }) => (
    <button
      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline focus:outline-none"
      onClick={() => navigate(`/jobs/${job._id}`)}
    >
      {job.jobNumber}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Logged in as <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">{role}</span>
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <input 
            type="text" 
            placeholder="Search all jobs..." 
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs found</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-sm mb-6">Get started by creating a new factory job. Your active jobs will appear here.</p>
          <button 
            onClick={() => navigate('/admin/create-job')}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transform hover:-translate-y-0.5 transition-all"
          >
            Create New Job
          </button>
        </div>
      ) : (
        <>
          {/* ================= NEEDS APPROVAL ================= */}
          {needsApproval.length > 0 && (
            <section className="bg-white dark:bg-slate-900 shadow-xl shadow-red-200/30 dark:shadow-none rounded-2xl mb-8 overflow-hidden border border-red-100 dark:border-red-950/60 transition-colors">
              <div className="px-6 py-5 border-b border-red-100 dark:border-red-950/60 bg-gradient-to-r from-red-50 to-white dark:from-red-950/30 dark:to-slate-900 flex items-center justify-between">
                <h2 className="text-lg leading-6 font-bold text-red-800 dark:text-red-400 flex items-center">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Needs Approval
                </h2>
                <span className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{needsApproval.length} Pending</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-red-100 dark:divide-red-950/40">
                  <thead className="bg-red-50/50 dark:bg-slate-800/80">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Job No</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
                    {needsApproval.map((job) => (
                      <tr key={job._id} className="hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap text-sm"><JobLink job={job} /></td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 font-medium">{job.companyName}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{job.vehicleNumber}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => approveJob(job._id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform group-hover:scale-105 transition-all"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================= IN PROGRESS ================= */}
          {inProgress.length > 0 && (
            <section className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/50 dark:to-slate-900">
                <h2 className="text-lg leading-6 font-bold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  Active Pipeline
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                  <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Job No</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Worker</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800/60">
                    {inProgress.map((job) => (
                      <tr key={job._id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-all duration-150 group">
                        <td className="px-6 py-5 whitespace-nowrap text-sm"><JobLink job={job} /></td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              job.status === "DISPATCHED" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" : 
                              "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-sm"
                            }`}>
                              {job.status === "DISPATCHED" ? "DISPATCHED" : job.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                          {job.assignedWorker ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                              <svg className="w-3.5 h-3.5 mr-1.5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                              {job.assignedWorker.name}
                            </span>
                          ) : (
                            <select
                              defaultValue=""
                              onChange={(e) => assignWorker(job._id, e.target.value)}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900 font-medium text-yellow-800 dark:text-yellow-300 cursor-pointer transition-colors"
                            >
                              <option value="" disabled>Assign Operator</option>
                              {workers.map((w) => (
                                <option key={w._id} value={w._id}>{w.name}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 font-medium">{job.companyName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
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
        </>
      )}

    </div>
  );
}

export default AdminDashboard;
