import { PeraWalletConnect } from "@perawallet/connect"

export const peraWallet = new PeraWalletConnect()

export async function connectWallet() {
  const accounts = await peraWallet.connect()
  const account = accounts[0]
  localStorage.setItem("wallet", account)
  return account
}

export async function reconnectWallet() {
  try {
    const accounts = await peraWallet.reconnectSession()
    if (accounts.length) {
      localStorage.setItem("wallet", accounts[0])
      return accounts[0]
    }
  } catch {}
  return null
}

export function getWallet() {
  return localStorage.getItem("wallet")
}

export function disconnectWallet() {
  peraWallet.disconnect()
  localStorage.removeItem("wallet")
}
