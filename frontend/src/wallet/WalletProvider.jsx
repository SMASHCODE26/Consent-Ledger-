import { createContext, useContext, useEffect, useState } from "react"
import {
  connectWallet,
  reconnectWallet,
  disconnectWallet,
} from "./pera"

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reconnectWallet().then(acc => {
      if (acc) setWallet(acc)
      setLoading(false)
    })
  }, [])

  const login = async () => {
    const acc = await connectWallet()
    setWallet(acc)
  }

  const logout = () => {
    disconnectWallet()
    setWallet(null)
  }

  return (
    <WalletContext.Provider value={{ wallet, login, logout, loading }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
