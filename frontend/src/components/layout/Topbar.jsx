import { useWallet } from "../../wallet/WalletProvider"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function Topbar() {
  const { wallet, login, logout } = useWallet()
  const [open, setOpen] = useState(false)

  return (
    <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
      <h2 className="font-medium">Consent Dashboard</h2>

      {!wallet ? (
        <button
          onClick={login}
          className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Connect Wallet
        </button>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Avatar Badge */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
              {wallet.slice(2, 4).toUpperCase()}
            </div>
            <span className="text-sm opacity-70">
              {wallet.slice(0, 6)}...
            </span>
          </div>

          {/* Hover Card */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-xl"
              >
                <p className="text-xs text-zinc-400 mb-1">Connected Wallet</p>

                <p className="text-sm break-all font-mono bg-black/40 p-2 rounded">
                  {wallet}
                </p>

                <button
                  onClick={logout}
                  className="mt-3 w-full bg-red-500/80 hover:bg-red-500 text-sm py-2 rounded-lg transition"
                >
                  Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
