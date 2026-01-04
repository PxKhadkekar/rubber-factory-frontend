import { useEffect, useState } from "react";
import axios from "axios";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No auth token found");
        }

        const res = await axios.get(
          "http://localhost:5001/api/audit-logs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <p>Loading audit logs...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <>
      <h2>Audit Logs</h2>
      <p>System activity and accountability</p>

      {logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            marginTop: "20px",
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <thead style={{ backgroundColor: "#f3f4f6" }}>
            <tr>
              <th>Time</th>
              <th>Job No</th>
              <th>Action</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.jobNumber || "-"}</td>
                <td>{log.action}</td>
                <td>{log.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
