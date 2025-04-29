"server-only"

import { cookies } from "next/headers"

/* Las siguientes son herramientas excelentes que están muy probadas en producción
y funcionan muy bien para el manejo de JWT en Node.js y JavaScript: */
import { SignJWT, jwtVerify } from "jose"

/* Para que funcione el método decrypt y isSessionValid debemos tener esta variable
de entorno:
SESSION_SECRET=2037745262d46eddec63bd2381d1904359fc6b5736da1dcc50799d721a817a6f */
const secretKey = process.env.SESSION_SECRET

if (!secretKey && process.env.NODE_ENV !== "development") {
  throw new Error("[session]: please set a valid value for SESSION_SECRET")
}

const encodedKey = new TextEncoder().encode(secretKey)

type SessionPayload = {
  userId: string
}

export async function encrypt(
  payload: SessionPayload, // <- lo que queremos encriptar.
  expirationTime?: number | string | Date,
) {
  /*
  * SignJWT
  Permite firmar nuestro JWT con una llave.
  */
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // <- HS256 es el algoritmo que se usará en la encriptación
    .setIssuedAt() // <- establece el momento en el que se crea esta llave
    .setExpirationTime(expirationTime ?? "7d") // <- establece un periodo por el cual la llave se considera expirada o no
    .sign(encodedKey) // <- firma toda la información para producir nuestro JWT con una llave que guardamos en nuestros secretos (es como la llave de una herradura, solo con la llave podrémos abrir (desencriptar) el JWT).
}

export async function decrypt(session: string | undefined = "") {
  try {
    /*
    * jwtVerify
    Permite verificar el JWT. Recibe el valor encriptado, en este caso session es el
    valor que tenemos en la cookie y que encriptamos, y vamos a intentar desencriptarlo con
    nuestra llave de autenticación (encodedKey) y con el algoritmo que nosotros esperamos
    que está encriptado (HS256).

    Si la desencriptación nos funciona vamos aobtener nuestros valores, pero si no funcioan se debe a que el usuario
    cambio valores, porque intentaron usar otra encodedKey que no es válida, expiró el JWT o porque borraron la cookie con el valor.
    */
    const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
      algorithms: ["HS256"],
    })

    return payload
  } catch (error) {
    console.log("Failed to verify session", error)
  }
}

export const COOKIE_NAME = "__session__"

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7d
  /* session es el valor de la cookie que vamos a crear */
  /* Siempre tenemos que asumir que la información va a ser robada
    por entes maliciosos por lo que  idealmente debemos encriptar la información
    que guardaremos en la cookie: */
  const session = await encrypt({ userId }, "7d")
  const _cookies = await cookies()

  /*
  * Cookies
    Las cookies son excelentes para manejar la información, pero debemos ser cuidadosos.

    Las cookies pueden ser accedidas desde el navegador lo cual puede ser riesgoso porque
    se podrían robar las cookies de nuestra aplicación.

    Dependiendo de nuestro tipo de aplicación podríamos restringuir que JavaScript pueda
    acceder a las cookies y la información que guardemos en la cookie tiene que estar protegida,
    idealmente encriptada, y siempre tenemos que asumir que esta información va a ser robada
    por entes maliciosos por lo que la información no debe ser sensible para nuestro usuario.

    La mayor parte de los heucos de seguridad los introducimos nosotros con nuestro propio código,
    es por esto que es muy importante prestar atención especial a todos los detalles que hemos visto en estas clases:
    los secretos, la información que manejamos, la información que exponemos, la información que tenemos en
    el servidor y cliente, etc.

    * Configuración de la cookie para mejorar seguridad

    - httpOnly, es muy importante ya que indica al navegador y al servidor el alcance que
    tienen nuestras cookies. httpOnly: false significa que tanto el navegador como el servidor va
    a tener acceso a la cookie. httpOnly: true, significa que solo el servidor va a tener acceso a la cookie.

    - secure, indica que la cookie puede ser utilizada únicamente dentro de un contexto https.
    A excepción de http://localhost/ que sí se tendrá acceso a la cookie. Esto se hace por razones de seguridad
    para que los atacantes no hagan un downgrade del protocolo en el que estamos y que siempre lo fuerce a que
    esté dentro de un contexto seguro.

    - sameSite, es muy importante porque le dice al servidor y al navegador hacia dónde debe enviar y puede enviar la cookie
    que tiene el usuario. Hay una diferencia de las cookies frente al localStorage y es que la información del lcoalStorage
    siempre va a estar en el navegador y no se va a enviar a través de internet al servidor, sin embargo, las cookies
    sí son enviadas a través de los headers de absolutamente todos los http request que hagamos, el sameSite indica
    a cuáles request el navegador debería adjuntar las cookies.
    EL valor "lax" significa que se va a enviar tanto a nuestro sitio, como subdominios y también a otros dominios
    que no pertenezcan al de nosotros. Si queremos ser realmente estrictos en nuestra seguridad podemos usar el valor
    "strict" para que únicamente restringa el uso de nuestra cookie dentro del contexto y dentro de nuestro dominio, cuando
    está "strict" la cookie no se va a enviar entre subdominios de nuestra aplicación.
  */
  _cookies.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "strict",
    path: "/",
  })
}

export async function deleteSession() {
  const _cookies = await cookies()
  _cookies.delete(COOKIE_NAME)
}

export async function isSessionValid(
  cookieValue: string | undefined | null,
): Promise<boolean> {
  if (!cookieValue) {
    return false
  }

  const session = await decrypt(cookieValue)

  return Boolean(session)
}
