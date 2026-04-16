# 🚁 Pilot Management Dashboard - Aviation Excellence

Una plataforma integral y premium para la gestión de tripulaciones, seguimiento de certificaciones normativas (ANAC) y archivo digital de legajos técnicos.

## 🚀 Características Principales

- **🔐 Seguridad Avanzada (RBAC)**: Sistema de inicio de sesión seguro con roles diferenciados para Administradores y Pilotos.
- **📂 Legajo Digital**: Capacidad de subir y gestionar evidencias (PDF/Imágenes) para cada certificación (CMA, Licencias, Cursos).
- **📅 Calendario de Flota**: Visualización gráfica de todos los vencimientos de la organización mes a mes.
- **📄 Reportes Profesionales**: Generación de fichas técnicas en PDF de alta fidelidad para auditorías e inspecciones.
- **🔔 Motor de Alertas**: Sistema de detección anticipada de vencimientos críticos (<30 días) y preventivos (<60 días).
- **📱 Onboarding Digital**: Generación de invitaciones únicas para el auto-registro de la tripulación.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: SQLite + Prisma ORM
- **Autenticación**: NextAuth.js v5
- **Estilos**: Tailwind CSS + Framer Motion (Animaciones)
- **Iconos**: Lucide React
- **Reportes**: React-to-Print

## 🔑 Credenciales Iniciales (Admin)

Para acceder al panel de administración y gestionar las invitaciones:

- **Usuario**: `admin@empresa.com`
- **Contraseña**: `adminpassword123`

## ⚙️ Configuración y Despliegue

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Sincronizar Base de Datos**:
   ```bash
   npx prisma db push
   ```

3. **Iniciar Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```

---

## 📸 Notas de Desarrollo
Este proyecto ha sido diseñado siguiendo los estándares de **Aviation Excellence**, priorizando la integridad de los datos, la facilidad de uso para el piloto y la disponibilidad de evidencias para autoridades aeronáuticas.
