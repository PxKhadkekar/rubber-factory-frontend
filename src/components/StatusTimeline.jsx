import { STATUS_FLOW } from "../constants/jobStatusFlow";

const StatusTimeline = ({ currentStatus }) => {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="w-full">
      <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-4">Status Timeline</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {STATUS_FLOW.map((status, index) => {
          let state = "future";
          if (index < currentIndex) state = "completed";
          if (index === currentIndex) state = "current";

          return (
            <div
              key={status}
              className={`flex items-center px-4 py-3 rounded-xl border transition-all ${
                state === "completed" 
                  ? "bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/60" 
                  : state === "current" 
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 font-bold border-blue-300 dark:border-blue-700 shadow-sm" 
                  : "bg-gray-50 dark:bg-slate-800/40 text-gray-400 dark:text-slate-500 border-gray-100 dark:border-slate-800"
              }`}
            >
              <span className="mr-2.5 flex-shrink-0 flex items-center justify-center w-5 h-5">
                {state === "completed" && (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {state === "current" && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                {state === "future" && (
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600" />
                )}
              </span>

              <span className="text-xs font-semibold">{status.replaceAll("_", " ")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
