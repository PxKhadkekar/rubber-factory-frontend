import { STATUS_FLOW } from "../constants/jobStatusFlow";

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div style={{ maxWidth: "400px" }}>
      <h3>Status Timeline</h3>

      {STATUS_FLOW.map((status, index) => {
        let state = "future";

        if (index < currentIndex) state = "completed";
        if (index === currentIndex) state = "current";

        return (
          <div
            key={status}
            style={{
              padding: "8px 12px",
              marginBottom: "6px",
              borderRadius: "6px",
              backgroundColor:
                state === "completed"
                  ? "#d1fae5"   // green
                  : state === "current"
                  ? "#dbeafe"   // blue
                  : "#f3f4f6",  // grey
              fontWeight: state === "current" ? "bold" : "normal",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>
              {state === "completed" && "✔"}
              {state === "current" && "➤"}
              {state === "future" && "•"}
            </span>

            <span>{status.replaceAll("_", " ")}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
