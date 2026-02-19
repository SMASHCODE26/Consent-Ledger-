import Sidebar from "../components/layout/Sidebar"
import Topbar from "../components/layout/Topbar"

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
