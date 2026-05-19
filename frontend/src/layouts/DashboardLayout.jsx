import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Subtle background glow for dashboard pages */}
      <div className="fixed top-20 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[0%] right-[0%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[0%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>
      <Outlet />
    </div>
  );
}
