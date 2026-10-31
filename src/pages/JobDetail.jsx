import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import StatusTimeline from "../components/StatusTimeline";
import Measurements from "../components/Measurements";
import { getUserRole } from "../utils/auth";
import AdminActions from "../components/AdminActions";

const STATUS_FLOW = [
  "AWAITING_ADMIN_APPROVAL",
  "GRINDING",
  "SANDBLASTING",
  "COATING",
  "DISPATCHED",
];

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = getUserRole();
  const isWorker = role === "WORKER";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("JOB DETAIL ERROR:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleStatusChange = async (nextStatus) => {
    if (nextStatus === job.status) return;

    const confirmed = window.confirm(
      `Move job from ${job.status} to ${nextStatus}?`
    );

    if (!confirmed) return;

    try {
      const res = await api.patch(`/jobs/${job._id}/status`, {
        status: nextStatus,
      });
      setJob(res.data);
      toast.success(`Job moved to ${nextStatus}`);
    } catch (err) {
      console.error("STATUS UPDATE FAILED:", err);
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Loading job...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl my-4 max-w-4xl mx-auto">
      {error}
    </div>
  );

  if (!job) return <div className="p-4 text-gray-500 dark:text-slate-400 text-center">Job not found</div>;

  const currentIndex = STATUS_FLOW.indexOf(job.status);
  const nextStatus =
    currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
      ? STATUS_FLOW[currentIndex + 1]
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Detail</h2>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl mb-8 overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/60 dark:to-slate-900">
          <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Job Summary
          </h3>
        </div>
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-4 border border-gray-100 dark:border-slate-700/60 hover:shadow-md transition-shadow">
            <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Job Number</span>
            <span className="block text-lg text-gray-900 dark:text-white font-bold">{job.jobNumber}</span>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-4 border border-gray-100 dark:border-slate-700/60 hover:shadow-md transition-shadow">
            <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Status</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">{job.status}</span>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-4 border border-gray-100 dark:border-slate-700/60 hover:shadow-md transition-shadow">
            <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Company</span>
            <span className="block text-sm text-gray-900 dark:text-white font-semibold flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {job.companyName}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-4 border border-gray-100 dark:border-slate-700/60 hover:shadow-md transition-shadow">
            <span className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vehicle</span>
            <span className="block text-sm text-gray-900 dark:text-white font-semibold flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              {job.vehicleNumber}
            </span>
          </div>
        </div>
      </div>

      {isWorker && nextStatus && job.status !== "DISPATCHED" && (
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl mb-6 overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">Advance Workflow</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Ready for the next manufacturing stage?</p>
            </div>
            <button 
              onClick={() => handleStatusChange(nextStatus)}
              className="inline-flex items-center px-5 py-2.5 rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              Move to {nextStatus}
            </button>
          </div>
        </div>
      )}

      {/* Timeline Card */}
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl mb-6 overflow-hidden border border-gray-100 dark:border-slate-800 p-6 transition-colors">
        <StatusTimeline currentStatus={job.status} />
      </div>

      {/* Measurements Card */}
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl mb-6 overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white">Dimensional Metrics</h3>
        </div>
        <div className="p-6">
          <Measurements
            measurements={job.measurements}
            isEditable={isWorker}
            jobId={job._id}
          />
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl mb-6 overflow-hidden border border-red-100 dark:border-red-950/60 transition-colors">
          <div className="px-6 py-5 border-b border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/30">
            <h3 className="text-lg leading-6 font-bold text-red-800 dark:text-red-400">Admin Actions</h3>
          </div>
          <div className="p-6">
            <AdminActions job={job} />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
