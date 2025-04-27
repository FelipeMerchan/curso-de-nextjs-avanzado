import { NextRequest, NextResponse } from "next/server";

import { getLocale, hasPathnameLocale } from "@/utils/i18n"
import { cookies } from "next/headers"

import {
  isSessionValid,
  COOKIE_NAME as SESSION_COOKIE_NAME,
} from "@/utils/auth"

/*
Las cookies tienen una grandiferencia entre localStorage y sessionStorega y es que las cookies
las podemos compartir entre el navegador y el servidor, es por ello que en esta clase
usamos las cookies para guardar la información de la sesión.
*/

/* El middleware va a interceder entre el cliente y el backend.
Es perfecto para interceptar la request del usuario y según esto tomar deciciones
como por ejemplo hacer redirecciones. */
export async function middleware(request: NextRequest) {
  /* nextUrl es la ruta de a dónde va nuestro usuario */
  const { pathname } = request.nextUrl

  // Auth
  /* La autenticación es el mecanismo que tenemos para saber si un usuario
  que ingresa a nuestra aplicación tiene los permisos o no para acceder a ciertas páginas.
  Con el middleware de Next.js podemos evaluar las rutas y verificar si el usuario tiene permiso
  o no para acceder al contenido que intenta dirigirse. */
  // -------------

  // 1. Ignore todo lo que no sea de nuestra ruta /auth
  if (pathname.startsWith("/auth") && pathname !== "/auth/login") {
    const allCookies = await cookies() // <- las cookies ahora son asíncronas en la nueva versión de Next.js 15

    // 2. Verificar si hay una cookie de sesión válida
    const hasSession = await isSessionValid(
      allCookies.get(SESSION_COOKIE_NAME)?.value,
    )

    // 3. Si la hay, puede continuar
    if (hasSession) {
      return
    }

    // 4. Si no, redireccionar a la página de inicio de sesión
    /* Podríamos enviar directamente NextResponse.redirect("/auth/login"), sin embargo,
    si el usuario tiene parámetros en la url como por ejemplo, /auth/login?name=Felipe
    los perderíamos, es por ello que podemos crear una URL con la clase URL que recibe
    el pathname en su primer atributo (usará este pathname como la base) y la completamos
    con lo que sea que tengamos en nuestro request.nextUrl pasandoselo en el segundo atributo.
    Así URL tomará el pathname como base y todos los search params que tengamos en la url (request.nextUrl)
    se van a heredar en la instancia de URL: */
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl))
  }

  // I18n
  // -------------

  // 1. Ignore todo lo que no sea de nuestra ruta /i18n
  if (!pathname.startsWith("/i18n")) return

  // 2. Si el path ya contiene un local, ignorelo (ya esta ok)
  //    e.j.: /i18n/es
  const hasLocal = hasPathnameLocale(pathname)
  if (hasLocal) return

  // 3. Si no hay local, agregar el local a la URL
  //    e.j.: /i18n -> /i18n/es
  /* Podemos detectar la locale que le deberíamos dar a un usuario
  por medio de un header llamado Accept-Language. Este lo configuran
  los navegadores de los usuarios en base al sistema operativo del usuario
  y los idiomas que el usuarios tenga agregados en el navegador, es decir,
  en los settigns del navegador donde se escogen los idiomas. */
  const locale = getLocale({
    "accept-language": request.headers.get("Accept-Language") || "",
  })
  /* Si el locale no viene en la ruta usamos el locale que obtenemos
  en getLocale para agregarlo a nuestra ruta: */
  request.nextUrl.pathname = `${pathname}/${locale}`

  /* Hacemos una redirección a la nueva url: */
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
}
