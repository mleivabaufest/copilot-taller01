import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import './App.css'

const LOGIN_PATH = '/login'
const WELCOME_PATH = '/welcome'
const SESSION_KEY = 'compliance-platform-session'
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
)

const normalizePathname = (pathname) =>
  pathname === WELCOME_PATH ? WELCOME_PATH : LOGIN_PATH

function getStoredSession() {
  try {
    const savedSession = window.sessionStorage.getItem(SESSION_KEY)

    if (!savedSession) {
      return null
    }

    const parsedSession = JSON.parse(savedSession)

    if (!parsedSession?.accessToken) {
      window.sessionStorage.removeItem(SESSION_KEY)
      return null
    }

    return parsedSession
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

function persistSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearStoredSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

function subscribeToRoute(callback) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

function getRouteSnapshot() {
  return normalizePathname(window.location.pathname)
}

function updateBrowserRoute(nextRoute, replace = false) {
  if (window.location.pathname === nextRoute) {
    return
  }

  window.history[replace ? 'replaceState' : 'pushState']({}, '', nextRoute)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function App() {
  const route = useSyncExternalStore(subscribeToRoute, getRouteSnapshot)
  const [session, setSession] = useState(() => getStoredSession())
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useCallback((nextRoute, { replace = false } = {}) => {
    updateBrowserRoute(normalizePathname(nextRoute), replace)
  }, [])

  useEffect(() => {
    const expectedPath = session ? WELCOME_PATH : LOGIN_PATH

    if (route !== expectedPath || window.location.pathname !== expectedPath) {
      updateBrowserRoute(expectedPath, true)
    }
  }, [route, session])

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((currentCredentials) => ({
      ...currentCredentials,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)

    try {
      const username = credentials.username.trim()
      const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password: credentials.password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.detail || 'No fue posible iniciar sesión.')
      }

      const nextSession = {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        username,
        startedAt: new Date().toISOString(),
      }

      persistSession(nextSession)
      setSession(nextSession)
      setMessage('Inicio de sesión exitoso.')
      navigate(WELCOME_PATH, { replace: true })
    } catch (requestError) {
      clearStoredSession()
      setSession(null)
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    clearStoredSession()
    setSession(null)
    setCredentials({ username: '', password: '' })
    setError('')
    setMessage('Sesión cerrada correctamente.')
    navigate(LOGIN_PATH, { replace: true })
  }

  const tokenPreview = useMemo(() => {
    if (!session?.accessToken) {
      return ''
    }

    return `${session.accessToken.slice(0, 24)}…`
  }, [session])

  const isWelcomePage = Boolean(session)

  return (
    <div className="app-shell">
      <div className="ambient-background" aria-hidden="true" />
      <div className="card-shell">
        <main className="main-card">
          <section className="hero-panel">
            <p className="eyebrow">Compliance Platform</p>
            <h1>{isWelcomePage ? 'Bienvenido nuevamente' : 'Accede a tu sesión'}</h1>
            <p className="hero-copy">
              {isWelcomePage
                ? 'Tu sesión está protegida y el token se conserva únicamente durante la sesión activa del navegador.'
                : 'Inicia sesión con las credenciales del backend para obtener un token JWT y acceder a la pantalla protegida.'}
            </p>
            <div className="hero-metrics">
              <article>
                <span>Ruta protegida</span>
                <strong>/welcome</strong>
              </article>
              <article>
                <span>API backend</span>
                <strong>{API_URL}</strong>
              </article>
            </div>
          </section>

          <section className="content-panel">
            <div className="panel-header">
              <span className="panel-tag">
                {isWelcomePage ? 'Sesión activa' : 'Autenticación JWT'}
              </span>
              <p className="panel-description">
                {isWelcomePage
                  ? 'Solo puedes permanecer aquí si existe un token guardado en sessionStorage.'
                  : 'Credenciales de prueba disponibles: admin / admin123.'}
              </p>
            </div>

            {error ? (
              <p className="feedback feedback-error" role="alert">
                {error}
              </p>
            ) : null}

            {message ? <p className="feedback feedback-success">{message}</p> : null}

            {isWelcomePage ? (
              <div className="welcome-card">
                <dl className="session-details">
                  <div>
                    <dt>Usuario</dt>
                    <dd>{session.username}</dd>
                  </div>
                  <div>
                    <dt>Token</dt>
                    <dd title={session.accessToken}>{tokenPreview}</dd>
                  </div>
                  <div>
                    <dt>Tipo</dt>
                    <dd>{session.tokenType}</dd>
                  </div>
                  <div>
                    <dt>Expiración</dt>
                    <dd>{session.expiresIn} segundos</dd>
                  </div>
                </dl>

                <button type="button" className="primary-button" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <label className="field">
                  <span>Usuario</span>
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    autoComplete="username"
                    placeholder="admin"
                    required
                  />
                </label>

                <label className="field">
                  <span>Contraseña</span>
                  <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    placeholder="admin123"
                    required
                  />
                </label>

                <button type="submit" className="primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
                </button>
              </form>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
