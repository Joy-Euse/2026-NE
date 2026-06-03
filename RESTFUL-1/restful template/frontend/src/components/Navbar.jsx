import { useSelector } from "react-redux";
import Badge from "./Badge";
import { fullName } from "../utils/roles";

function Navbar() {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-secondary">Fire Extinguisher Management</h1>
          <p className="text-sm text-slate-500">Inventory, inspections, maintenance, and compliance</p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">{fullName(user)}</span>
            <Badge tone="blue">{user.role}</Badge>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
