import { ShieldCheck, AppWindow, FileText } from "lucide-react"
import { NavLink } from "react-router-dom"

const items = [
  { label: "Consent", icon: ShieldCheck, path: "/consent" },
  { label: "App Access", icon: AppWindow, path: "/apps" },
  { label: "Audit Logs", icon: FileText, path: "/audit" },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-white/10 p-6">
      <h1 className="text-xl font-bold text-indigo-400 mb-6">
        ConsentLedger
      </h1>

      <nav className="space-y-2">
        {items.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive ? "bg-indigo-500/20" : "hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
