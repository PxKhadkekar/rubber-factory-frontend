import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("JOB DETAIL ERROR:", err.response?.status, err.response?.data);
        setError("Failed to load job");
      }
       finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) return <p>Loading job...</p>;
  if (error) return <p>{error}</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h2>Job Detail Page</h2>

      <section>
        <h3>Job Header</h3>
        <p><strong>Job Number:</strong> {job.jobNumber}</p>
        <p><strong>Status:</strong> {job.status}</p>
        <p><strong>Company:</strong> {job.companyName}</p>
        <p>
          <strong>Assigned Worker:</strong>{" "}
          {job.assignedWorker ? "Assigned" : "Not assigned"}
        </p>
      </section>
    </div>
  );
};

export default JobDetail;
