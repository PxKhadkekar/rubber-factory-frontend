import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import StatusTimeline from "../components/StatusTimeline";
import Measurements from "../components/Measurements";
import { getUserRole } from "../utils/auth";
import AdminActions from "../components/AdminActions";




const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = getUserRole();
const isEditable = role === "WORKER";


  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error(
          "JOB DETAIL ERROR:",
          err.response?.status,
          err.response?.data
        );
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) return <p>Loading job...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Job not found</p>;

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
        <p>
          <strong>Assigned Worker:</strong>{" "}
          {job.assignedWorker ? "Assigned" : "Not assigned"}
        </p>
      </section>

      {/* ===== STATUS TIMELINE ===== */}
      <section style={{ marginBottom: "24px" }}>
        <StatusTimeline currentStatus={job.status} />
      </section>

      <section style={{ marginBottom: "24px" }}>
  <Measurements
    measurements={job.measurements}
    isEditable={isEditable}
    jobId={job._id}
  />
</section>




      {/* ===== AUDIT LOG (COMING LATER) ===== */}
      <section style={{ marginBottom: "24px" }}>
        <h3>Audit Log</h3>
        <p>Audit entries will appear here.</p>
      </section>

      {/* ===== ADMIN ACTIONS ===== */}
<section>
  <AdminActions job={job} />
</section>

    </div>
  );
};

export default JobDetail;
