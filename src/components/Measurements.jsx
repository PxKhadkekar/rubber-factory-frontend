import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

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
      toast.success(`${fields.find(f => f.key === key)?.label} updated`);
    } catch (err) {
      console.error("MEASUREMENT SAVE ERROR:", err);
      toast.error("Failed to save measurement");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="w-full">
      {!isEditable && (
        <p className="text-sm text-gray-500 dark:text-slate-400 italic mb-4">
          Measurements are locked after dispatch.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label }) => (
          <div
            key={key}
            className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/60 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>

            {isEditable ? (
              <input
                type="number"
                value={localValues[key] ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                onBlur={() => handleBlur(key)}
                disabled={savingKey === key}
                className={`w-28 px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity ${
                  savingKey === key ? "opacity-50" : "opacity-100"
                }`}
              />
            ) : (
              <strong className="text-sm text-gray-900 dark:text-white">
                {measurements?.[key] !== undefined ? measurements[key] : "—"}
              </strong>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Measurements;
