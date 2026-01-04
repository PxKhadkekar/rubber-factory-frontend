import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import StatusTimeline from "../components/StatusTimeline";
import Measurements from "../components/Measurements";
import { getUserRole } from "../utils/auth";
import AdminActions from "../components/AdminActions";
import "./JobDetail.css";

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
  const isAdmin = role === "ADMIN";

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

  const currentIndex = STATUS_FLOW.indexOf(job.status);
  const nextStatus =
    currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
      ? STATUS_FLOW[currentIndex + 1]
      : null;

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      <h2>Job Detail</h2>

      <div className="detail-section">
        <section>
          <h3>Job Summary</h3>
          <p><strong>Job Number:</strong> {job.jobNumber}</p>
          <p><strong>Status:</strong> {job.status}</p>
          <p><strong>Company:</strong> {job.companyName}</p>
          <p><strong>Vehicle:</strong> {job.vehicleNumber}</p>
        </section>
      </div>

      {isWorker && nextStatus && job.status !== "DISPATCHED" && (
        <div className="detail-section">
          <section>
            <h3>Update Status</h3>
            <button onClick={() => handleStatusChange(nextStatus)}>
              Move to {nextStatus}
            </button>
          </section>
        </div>
      )}

      <div className="detail-section">
        <section>
          <StatusTimeline currentStatus={job.status} />
        </section>
      </div>

      <div className="detail-section">
        <section>
          <Measurements
            measurements={job.measurements}
            isEditable={isWorker}
            jobId={job._id}
          />
        </section>
      </div>

      <div className="detail-section">
        <section>
          <h3>Audit Log</h3>
          <p>
            All actions on this job are recorded and available in the Audit Logs
            section.
          </p>
        </section>
      </div>

      {isAdmin && (
        <div className="detail-section">
          <section>
            <AdminActions job={job} />
          </section>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
