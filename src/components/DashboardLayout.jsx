import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto"> 
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;