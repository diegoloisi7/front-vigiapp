import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { API_URL, USAR_MOCK } from '../api/config'
import { pedir } from '../api/cliente'
import { useGrupos } from '../context/GruposContext'

interface UrgentEvent { groupId: number; incidentId: number; message: string }
interface Notification { id: number; incidenteId: number | null; grupoId: number | null; titulo: string; mensaje: string; leida: boolean }

export default function RealtimeAlerts() {
  const [event, setEvent] = useState<UrgentEvent | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [trayOpen, setTrayOpen] = useState(false)
  const { cambiarGrupoActivo, grupos } = useGrupos()
  const groupIds = grupos.map((group) => group.id).sort((a, b) => a - b).join(',')

  useEffect(() => {
    if (USAR_MOCK) return
    const token = sessionStorage.getItem('vigiapp_token')
    if (!token) return
    const socket = io(API_URL.replace(/\/api$/, ''), { auth: { token }, transports: ['websocket'] })
    const refresh = () => {
      window.dispatchEvent(new Event('vigiapp:refrescar'))
      void pedir<Notification[]>('/notificaciones').then(setNotifications).catch(() => {})
    }
    socket.on('connect', refresh)
    socket.on('incident:urgent', (payload: UrgentEvent) => {
      setEvent(payload)
      refresh()
    })
    return () => { socket.disconnect() }
  }, [groupIds])

  if (USAR_MOCK) return null
  async function markRead(notification: Notification) {
    if (notification.grupoId) cambiarGrupoActivo(notification.grupoId)
    setTrayOpen(false)
    await pedir(`/notificaciones/${notification.id}/leida`, { metodo: 'PATCH' })
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, leida: true } : item))
  }
  return <>
    <div style={{ position: 'fixed', right: 16, top: 70, zIndex: 3000 }}>
      <button type="button" className="btn btn-outline" aria-expanded={trayOpen} onClick={() => setTrayOpen(!trayOpen)}>
        🔔 {notifications.filter((item) => !item.leida).length}
      </button>
      {trayOpen && <div className="card" style={{ maxWidth: 340, maxHeight: 320, overflowY: 'auto', padding: 12 }}>
        <strong>Notificaciones</strong>
        {notifications.length === 0 && <p>No tenés notificaciones.</p>}
        {notifications.map((notification) => <div key={notification.id}>
          <p><strong>{notification.titulo}</strong><br />{notification.mensaje}</p>
          {notification.incidenteId ? <Link to={`/app/incidencias/${notification.incidenteId}`} onClick={() => {
              if (notification.grupoId) cambiarGrupoActivo(notification.grupoId)
              setTrayOpen(false)
              if (!notification.leida) void markRead(notification).catch(() => {})
            }}>Ver incidente</Link>
            : !notification.leida && <button type="button" className="btn btn-ghost" onClick={() => { void markRead(notification).catch(() => {}) }}>Marcar como leída</button>}
        </div>)}
      </div>}
    </div>
    {event && <div className="card" role="alert" style={{ position: 'fixed', right: 16, bottom: 88, zIndex: 3000, maxWidth: 360, padding: 16 }}>
      <strong>🆘 Pedido de ayuda urgente</strong>
      <p>{event.message}</p>
      <Link to={`/app/incidencias/${event.incidentId}`} className="btn btn-primary" onClick={() => {
        cambiarGrupoActivo(event.groupId)
        setEvent(null)
      }}>Ver incidente</Link>
      <button type="button" className="btn btn-ghost" onClick={() => setEvent(null)}>Cerrar</button>
    </div>}
    {notifications.some((item) => !item.leida) && <span className="sr-only" role="status">Tenés {notifications.filter((item) => !item.leida).length} notificaciones sin leer.</span>}
  </>
}
