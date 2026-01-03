import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
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
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = getUserRole();
  const isWorker = role === "WORKER";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("JOB DETAIL ERROR:", err);
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ===== STATUS CHANGE HANDLER (CORE OF UX POLISH) =====
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
    } catch (err) {
      console.error("STATUS UPDATE FAILED:", err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p>Loading job...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Job not found</p>;

  // ===== DETERMINE NEXT STATUS OPTIONS =====
  const currentIndex = STATUS_FLOW.indexOf(job.status);
  const nextStatuses =
    currentIndex >= 0
      ? STATUS_FLOW.slice(currentIndex + 1)
      : [];

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      <h2>Job Detail Page</h2>

      {/* ===== JOB HEADER ===== */}
      <section style={{ marginBottom: "24px" }}>
        <h3>Job Header</h3>
        <p>
          <strong>Job Number:</strong> {job.jobNumber}
        </p>
        <p>
          <strong>Status:</strong> {job.status}
        </p>
        <p>
          <strong>Company:</strong> {job.companyName}
        </p>
      </section>

      {/* ===== WORKER STATUS CONTROL ===== */}
      {isWorker && job.status !== "DISPATCHED" && (
        <section style={{ marginBottom: "24px" }}>
          <h3>Update Status</h3>

          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value={job.status}>{job.status}</option>
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </section>
      )}

      {/* ===== STATUS TIMELINE ===== */}
      <section style={{ marginBottom: "24px" }}>
        <StatusTimeline currentStatus={job.status} />
      </section>

      {/* ===== MEASUREMENTS ===== */}
      <section style={{ marginBottom: "24px" }}>
        <Measurements
          measurements={job.measurements}
          isEditable={isWorker}
          jobId={job._id}
        />
      </section>

      {/* ===== AUDIT LOG (PLACEHOLDER) ===== */}
      <section style={{ marginBottom: "24px" }}>
        <h3>Audit Log</h3>
        <p>No activity yet.</p>
      </section>

      {/* ===== ADMIN ACTIONS ===== */}
      <section>
        <AdminActions job={job} />
      </section>
    </div>
  );
};

export default JobDetail;
