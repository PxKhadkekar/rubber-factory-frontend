import { useEffect, useState } from "react";
import api from "../api/axios";

const Measurements = ({ measurements, isEditable, jobId }) => {
  const [localValues, setLocalValues] = useState(measurements || {});
  const [savingKey, setSavingKey] = useState(null);

  const fields = [
    { key: "jobLength", label: "Job Length" },
    { key: "jobOldOd", label: "Old OD" },
    { key: "jobMsOd", label: "MS OD" },
    { key: "requiredOd", label: "Required OD" },
    { key: "finishOd", label: "Finish OD" },
    { key: "eboniteOd", label: "Ebonite OD" },
    { key: "roughOd", label: "Rough OD" },
    { key: "msWeight", label: "MS Weight" },
  ];

  // Keep local state in sync if job reloads
  useEffect(() => {
    setLocalValues(measurements || {});
  }, [measurements]);

  const handleChange = (key, value) => {
    if (!isEditable) return;

    setLocalValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBlur = async (key) => {
    if (!isEditable) return;

    setSavingKey(key);

    try {
      await api.patch(`/jobs/${jobId}/measurements`, {
        measurements: {
          [key]: Number(localValues[key]),
        },
      });
    } catch (err) {
      console.error("MEASUREMENT SAVE ERROR:", err);
      alert("Failed to save measurement");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="section-card">
      <h3>Measurements</h3>

      {!isEditable && (
        <p className="empty-text">
          Measurements are locked after dispatch.
        </p>
      )}

      {fields.map(({ key, label }) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span>{label}</span>

          {isEditable ? (
            <input
              type="number"
              value={localValues[key] ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              disabled={savingKey === key}
              style={{
                width: "120px",
                padding: "4px 6px",
                opacity: savingKey === key ? 0.6 : 1,
              }}
            />
          ) : (
            <strong>
              {measurements?.[key] !== undefined
                ? measurements[key]
                : "—"}
            </strong>
          )}
        </div>
      ))}
    </div>
  );
};

export default Measurements;
