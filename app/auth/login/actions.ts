"use server"

import { createSession } from "@/utils/auth"
import { createHash, randomUUID } from "crypto"
import { redirect } from "next/navigation"

// Hash de nuestro secreto usando
// https://hash.online-convert.com/es/generador-sha256
/* Los hash son un sistema de encriptación de un único sentido, es decir,
que si encriptamos 'nunca pares de aprender' es prácticamente imposible saber cuál fue la palabra
que utilizamos para generarlo. Así que SECRET no podrá ser desencriptado: */
const SECRET =
  "2037745262d46eddec63bd2381d1904359fc6b5736da1dcc50799d721a817a6f"

export async function login(prevState: unknown, data: FormData) {
  const id = randomUUID() // <- creamos un ID random para simular un id de un usuario real
  const hash = createHash("sha256") // <- crea un hash protegido con un algoritmo de sha256
  const password = data.get("pwd") as string // <- obtenemos el valor del input del formulario que nos llega desde nuestro cliente

  console.log("login", { id, password })

  /* Lo que nos llegue del cliente lo vamos a hashear: */
  const hashedPassword = hash.update(password).digest("hex")

  /* Comapramos el valor ingresado por el usuario en el formulario vs el SECRET: */
  if (hashedPassword !== SECRET) {
    /* Este objeto es el que obtenemos en state de useActionState de la página auth/login */
    return { error: "Invalid secret" }
  }

  await createSession(id)

  /* Hacemos una redirección a la página que teníamos protegida, que puede
  ser el inicio de la página, dashboard o cualquier página que tengamos que proteger y a
  la que el usuario había intentado acceder antes de autenticarse: */
  redirect("/auth")
}
