# Trading Tracker & Journal

Plataforma de gestión financiera y portafolio para traders de Prop Firms (Cuentas de Fondeo). Permite llevar un control exacto de las cuentas de evaluación compradas, cuentas en vivo (Live), gastos totales en challenges y ganancias por retiros (payouts), ofreciendo una visión clara del flujo de caja.

## 🏗️ Arquitectura y Funcionamiento Interno
- **Procesamiento de Métricas:** Motor lógico en Vanilla JavaScript que calcula métricas financieras en tiempo real (Net PnL, Return on Investment, y Ratios de Fondeo).
- **Data Visualization:** Integración con la librería **Chart.js** montada sobre elementos <canvas> para renderizar la curva de capital de los retiros frente a los gastos.
- **Capa de Datos Relacional:** Implementa un modelo de datos en el cliente vinculando transacciones con entidades de cuentas. Almacenamiento seguro en el navegador mediante localStorage.
- **Modo Oscuro Dinámico:** Interfaz adaptable mediante inyección de clases CSS en el DOM, sincronizando las preferencias del usuario.

## 📂 Estructura del Proyecto

`	ext
trading-tracker/
├── index.html                  # Vistas principales de la UI
├── app.js                      # Lógica de controladores y modelo de negocio
├── styles.css                  # Hoja de estilos con soporte para Dark Mode
├── avatar.jpg                  # Elemento UI (Perfil)
├── favicon.ico                 # Icono
├── icono-removebg-preview.png  # Logo principal
└── README.md
`

## 🚀 Instalación y Puesta en Marcha
Al ser una aplicación Web puramente estática, puede ser desplegada en cualquier servidor HTTP o ejecutada localmente.
1. **Clonar el repositorio:**
   `ash
   git clone https://github.com/Papito084/trading-tracker.git
   `
2. **Abrir en el navegador:** Ejecutar el archivo index.html en tu navegador web de preferencia.
