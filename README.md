# 🚀 Guía de Inicio Rápido (Quick Start)

Sigue estos tres sencillos pasos para tener la aplicación ejecutándose en tu computadora localmente:

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```
2. **Configurar Variables de Entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto y agrega tus claves de conexión:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```
3. **Iniciar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   *Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.*

---

# 🇻🇪 La Chinita — Coordinación de Ayuda Humanitaria

> *"Orden en el caos, ayuda donde más se necesita."*

**La Chinita** es una plataforma web moderna, intuitiva y sumamente eficiente diseñada para gestionar y trazar el flujo de donaciones, suministros y voluntariado en situaciones de emergencia humanitaria.

### 🌟 Propósito y Visión
El software nació para brindar orden sistémico en momentos críticos. Su estructura está pensada para mitigar el caos administrativo en centros de acopio, asegurando que cada recurso donado sea catalogado y entregado de manera transparente a los afectados.

### 🎯 Objetivos de Impacto
* **Para la Iglesia de La Chiquinquirá:** Organizar de forma transparente las donaciones de medicamentos, insumos quirúrgicos y comida que ingresan a la parroquia, garantizando la trazabilidad desde la recepción hasta la entrega a hospitales y refugios.
* **Para cualquier Centro de Acopio en el mundo:** Servir como una solución *open-source* lista para desplegar en minutos, capaz de unificar el censo de voluntarios y la contabilidad de inventario en cualquier parroquia, escuela o centro civil de ayuda.

---

## 🛠️ Especificaciones Técnicas y Arquitectura

La plataforma está desarrollada con estándares modernos de ingeniería de software para garantizar rapidez, escalabilidad y un rendimiento óptimo bajo alta concurrencia de usuarios:

* **Estructura del Frontend:** Desarrollado bajo **Next.js 14** empleando el **App Router** (`src/app`) para optimizar el renderizado y carga de páginas estáticas y dinámicas.
* **Tipado Seguro:** Escrito enteramente en **TypeScript**, previniendo errores en tiempo de compilación y asegurando la consistencia de los datos del inventario y perfiles.
* **Diseño Visual de Alto Impacto:** Sistema de estilos fluidos con **Tailwind CSS** que integra animaciones sutiles a través de **Framer Motion** y una interfaz moderna con efectos de desenfoque de fondo (*glassmorphism*).
* **Base de Datos Relacional:** Configurada bajo la **4ta Forma Normal (4NF)** para evitar redundancias de información y garantizar la integridad referencial de los lotes y habilidades del voluntariado.

---

## 👥 Roles de la Plataforma

* **Voluntarios (`usuario`):** Registro público a través de un formulario con detalles de contacto, habilidades y disponibilidad horaria. Acceso al directorio general.
* **Organizadores:** Encargados de ingresar productos (medicamentos, insumos quirúrgicos, alimentos), gestionando fechas de vencimiento, marcas y cantidades.
* **Despachadores:** Encargados de registrar la salida de productos hacia destinos específicos, con validación de stock en tiempo real.
