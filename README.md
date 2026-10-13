# Hábitos

> Pequeños pasos, cada día.

App web (PWA) para registrar hábitos diarios con un solo toque, seguir tu progreso y construir rachas. Todos los datos se guardan en tu dispositivo: sin cuenta, sin servidor.

## Características

- **Registro con un toque** — botón `+1` por hábito; mantén pulsado para registrar varias veces seguidas o usa «Con nota» para añadir una descripción.
- **Deshacer con gesto** — desliza la tarjeta hacia la izquierda para deshacer el último registro.
- **Metas y rachas** — meta diaria por hábito (5 registros) y meta total del día (10), con anillos de progreso, rachas en días y celebraciones con confeti.
- **Estadísticas e insights** — resumen de 7/14/30 días, gráfico de línea, mapa de actividad semanal, mejor día y tendencia frente al periodo anterior.
- **Historial** — consulta y revisa los registros de cada hábito.
- **Reportes** (`/report`) — vista semanal, mensual y anual con tasa de cumplimiento, días exitosos, total de registros y mejor racha.
- **Recordatorios** — notificaciones por hábito: una hora diaria, varias horas concretas o cada N horas dentro de un rango; opción de avisar solo si aún no has registrado ese día.
- **Feedback** — sonidos (desactivables), vibración háptica y mensajes de ánimo.
- **Guía inicial** — coach marks que explican los gestos principales.
- **PWA** — instalable en el móvil, con service worker y soporte para modo claro/oscuro.

## Rutas

| Ruta      | Descripción                                   |
| --------- | --------------------------------------------- |
| `/`       | Página de bienvenida                          |
| `/home`   | Tracker de hábitos del día                    |
| `/report` | Reportes semanales, mensuales y anuales       |

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- [Recharts](https://recharts.org) para los gráficos
- `localStorage` para la persistencia y Web Notifications API + Service Worker para los recordatorios

## Empezar

Requisitos: Node.js 20+ (o Bun).

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando         | Descripción                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Servidor de desarrollo           |
| `npm run build` | Build de producción              |
| `npm run start` | Sirve el build de producción     |
| `npm run lint`  | Ejecuta ESLint                   |

## Estructura del proyecto

```
app/
  page.tsx                 # Bienvenida
  home/                    # Tracker diario
  report/                  # Reportes por periodo
components/habits/         # Componentes de UI (tarjetas, sheets, gráficos, anillos…)
hooks/
  use-habit-reminders.ts   # Programación de recordatorios
lib/
  habits-storage.ts        # Modelo de datos y persistencia en localStorage
  habit-reports.ts         # Cálculo de reportes semanales/mensuales/anuales
  insights.ts              # Resúmenes y tendencias
  notification-prefs.ts    # Preferencias y horarios de recordatorios
  notifications.ts         # Permisos, service worker y envío de notificaciones
  habit-feedback.ts        # Metas y mensajes de ánimo
  sounds.ts / haptics.ts   # Feedback sonoro y háptico
public/
  manifest.webmanifest     # Manifest de la PWA
  sw.js                    # Service worker
```

## Datos y privacidad

Los hábitos y registros se guardan en `localStorage` bajo la clave `habitos-app-tracking`. No se envía nada a ningún servidor; si borras los datos del navegador, se pierde el historial.
