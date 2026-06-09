// Token storage strategy
// ----------------------------------------------------------------------------
// - REFRESH token  -> localStorage ('wb_admin_refresh'). It is long-lived (7d)
//   and must survive a full page reload, so it has to be persisted.
// - ACCESS token   -> in memory only (module variable). It is short-lived
//   (60 min) and kept out of persistent storage to shrink the XSS blast radius.
//   On boot we mint a fresh access token from the stored refresh (see AuthContext).
const REFRESH_KEY = 'wb_admin_refresh'

let accessToken: string | null = null

export const getAccess = () => accessToken
export const setAccess = (t: string | null) => {
  accessToken = t
}

export const getRefresh = () => localStorage.getItem(REFRESH_KEY)
export const setRefresh = (t: string | null) => {
  if (t) localStorage.setItem(REFRESH_KEY, t)
  else localStorage.removeItem(REFRESH_KEY)
}

export const setTokens = (access: string, refresh: string) => {
  setAccess(access)
  setRefresh(refresh)
}

export const clearTokens = () => {
  setAccess(null)
  setRefresh(null)
}
