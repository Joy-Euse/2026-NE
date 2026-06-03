import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { FiBell, FiClipboard, FiFileText, FiGrid, FiLogOut, FiTool, FiUser, FiUsers } from "react-icons/fi";
import { MdOutlineFireExtinguisher } from "react-icons/md";
import { logout } from "../redux/authSlice";
import ConfirmDialog from "./ConfirmDialog";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { to: "/extinguishers", label: "Extinguishers", icon: MdOutlineFireExtinguisher, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { to: "/inspections", label: "Inspections", icon: FiClipboard, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { to: "/maintenance", label: "Maintenance", icon: FiTool, roles: ["ADMIN", "INSPECTOR"] },
  { to: "/notifications", label: "Notifications", icon: FiBell, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { to: "/reports", label: "Reports", icon: FiFileText, roles: ["ADMIN", "INSPECTOR"] },
  { to: "/users", label: "Users", icon: FiUsers, roles: ["ADMIN"] },
  { to: "/profile", label: "My Profile", icon: FiUser, roles: ["ADMIN", "INSPECTOR", "USER"] },
];

function Sidebar() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-secondary bg-secondary p-4 text-white">
      <div className="mb-6 px-2">
        <p className="text-xs uppercase tracking-wide text-white/55">TZW LTD</p>
        <h2 className="mt-1 text-lg font-semibold">Safety Control</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {links.filter((link) => link.roles.includes(user?.role)).map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  isActive ? "bg-primary text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => setConfirmLogout(true)}
        className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white"
      >
        <FiLogOut className="h-4 w-4" />
        Logout
      </button>
      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You will be signed out of the management system."
        confirmLabel="Log out"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => dispatch(logout())}
      />
    </aside>
  );
}

export default Sidebar;
