import { useEffect, useState } from "react";
import api from "../api/axios";
import { getUserRole } from "../utils/auth";

const AdminActions = ({ job }) => {
  const role = getUserRole();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState("");

  // 🔒 ADMIN ONLY
  if (role !== "ADMIN") {
    return null;
  }

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

  return (
    <div>
      <h3>Admin Actions</h3>

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
        </div>
      )}
    </div>
  );
};

export default AdminActions;
