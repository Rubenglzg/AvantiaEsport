# 🚀 Guía de Ejecución Local - Sooner

Esta guía detalla cómo abrir y probar cada una de las versiones de la plataforma en tu ordenador.

---

## 1. Web Pública y Plataforma (Dashboard)
Ambas funcionan bajo el mismo servidor de desarrollo de Vite.

### Pasos:
1. Asegúrate de que el servidor esté corriendo: `npm run dev`
2. Abre tu navegador en: [http://localhost:5173](http://localhost:5173)

### Cómo navegar:
*   **Web Pública (Landing)**: Se abre por defecto al entrar en la raíz `http://localhost:5173`.
*   **Plataforma (App)**: Debes ir a `http://localhost:5173/login` para entrar. Una vez logueado, la app te redirigirá automáticamente a `http://localhost:5173/dashboard`.

---

## 2. Aplicación de Escritorio (Windows/Mac)
Para abrir la versión que verán los usuarios que descarguen la app de escritorio.

### Pasos:
1. Asegúrate de tener `npm run dev` activo (para desarrollo en tiempo real).
2. En una nueva terminal, ejecuta:
   ```bash
   npm run electron:dev
   ```
3. Se abrirá una ventana independiente de Sooner con su propio icono y menú.

---

## 3. Aplicación Móvil (Android/iOS)
Para probar la versión móvil, Capacitor requiere sincronizar el código web con los proyectos nativos.

### Pasos previos:
Para ver cambios reflejados en el móvil, siempre debes construir la web primero:
```bash
npm run build
npx cap sync
```

### Para abrir en Android (Android Studio):
1. Ejecuta el comando:
   ```bash
   npm run cap:open:android
   ```
2. Esto abrirá **Android Studio**. Desde allí, puedes darle al botón de "Play" para lanzarlo en un emulador o en tu móvil físico conectado.

### Para abrir en iOS (Requiere Mac):
1. Ejecuta el comando:
   ```bash
   npm run cap:open:ios
   ```
2. Esto abrirá **Xcode**. Desde allí, selecciona un simulador de iPhone y pulsa "Run".

---

## 💡 Resumen de comandos rápidos

| Objetivo | Comando |
| :--- | :--- |
| **Iniciar todo (Web)** | `npm run dev` |
| **Abrir Escritorio** | `npm run electron:dev` |
| **Sincronizar cambios a Móvil** | `npm run build && npx cap sync` |
| **Abrir proyecto Android** | `npm run cap:open:android` |
| **Abrir proyecto iOS** | `npm run cap:open:ios` |
