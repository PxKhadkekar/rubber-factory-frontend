import { Outlet } from "react-router-dom";
import "./AppLayout.css";

const AppLayout = () => {
  return (
    <div className="app-container">
      <h2>Rubber Factory System</h2>

      <div className="layout-marker">
        LAYOUT START
      </div>

      {/* This is where pages render */}
      <Outlet />

      <div className="layout-marker">
        LAYOUT END
      </div>
    </div>
  );
};

export default AppLayout;
