"use server"

import { bookmarks } from "../schema"
import { orm } from "../db"
import { revalidateTag } from "next/cache"

export async function addBookmark(prevState: unknown, data: FormData) {
  const title = data.get("title") as string
  const url = data.get("url") as string

  console.log("Adding bookmark:", { title, url })

  const value = await orm.insert(bookmarks).values({ title, url }).returning()

  /* Le indicamos a Next.js que la información que tenga grabada dentro del tag
  bookmarks sea invalidada, es decir, Next.js eliminará los datos que tuviera en el cache para bookmarks, de forma tal
  que cuando se vuelva a realizar la petición a "http://localhost:3000/bookmarks/api"
  no haya ningún cache y vuelva a realizar la petición y la almacene en el cache. */
  revalidateTag("bookmarks")

  /*
  * 1. Cómo integrar errores correctamente con Server Actions.
  Next.js y React recomiendan que la forma en cómo debemos manejar errores
  es evitar el uso de try y catch, debido a cómo funciona Next.js internamente, y que
  usemos if y else en su lugar:
  */
  if (value.length <= 0) {
    return { error: "Fallo en agregar el marcador en la base de datos." }
  }
}
