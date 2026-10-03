# Trading Tracker & Journal

Plataforma de análisis de rendimiento para traders de cuentas de fondeo (Prop Firms), diseñada para registrar operaciones, calcular métricas de riesgo y visualizar curvas de capital (Equity Curves).

## 🏗️ Arquitectura y Funcionamiento Interno
- **Procesamiento de Métricas:** Motor lógico en Vanilla JavaScript que calcula métricas financieras complejas en tiempo real (Net PnL, Return on Investment, y Ratios de Aprobación/Fondeo).
- **Data Visualization:** Integración con la librería **Chart.js** montada sobre elementos <canvas> para renderizar la curva de capital dinámica interpolando progresiones algorítmicas de depósitos y retiros.
- **Capa de Datos Relacional:** Implementa un modelo de datos simplificado en el cliente, vinculando colecciones de transacciones (	radingTrackerTransactions) con entidades de cuentas (	radingTrackerAccounts) a través de llaves primarias generadas dinámicamente. Almacenamiento seguro vía localStorage.

## 📂 Estructura del Proyecto
`plaintext
trading-tracker/
├── index.html                  # Main View, Templates y Controladores JS
├── avatar.jpg                  # Recursos de interfaz (UI Profile Component)
├── favicon.ico                 # Iconografía de la app
├── icono-removebg-preview.png  # Asset del logo principal (Transparente)
└── README.md
`

## ⚙️ Despliegue
Al ser una aplicación Web puramente estática, puede ser desplegada en cualquier servidor HTTP (Nginx, Vercel, GitHub Pages) o ejecutada localmente en un sandbox de navegador estándar.
