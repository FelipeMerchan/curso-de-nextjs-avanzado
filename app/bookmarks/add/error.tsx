"use client"

import { useEffect } from "react"

import { Heading, Button } from "@chakra-ui/react"

/* En Next.js ya que tenemos react server components y server actions el manejo de error
cambia y hay formas que se deberían usar y que son sugerida a la hora de manejar estos errores.
En esta clase vamos a ver lo siguiente:

1. Cómo integrar errores correctamente con Server Actions.
2. Cómo manejar errores dentro de páginas de Next.js.
3. Cómo manejar errores de forma global.
*/

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}
/*
* 2. Cómo manejar errores dentro de páginas de Next.js.
Next.js nos ofrece el componente especial error.tsx.
En el momento en que haya un error (que no sea manejado por un server action
o en sí por el código) en la página /bookmarks/add Next.js
en lugar de cargar un error genérico va a cargar el componente
que creemos aquí.

Los errores que no son esperados van a ser capturados por error.tsx.
*/

export default function Error({ error, reset }: Props) {
  /* Es muy importante que utilicemos un efecto para que
  podamos hacer un reset del error usando el método reset que recibe el
  componente Error. El reset es obligatorio hacerlo para que siga funcionando la
  aplicación. */
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <Heading className="mb-4">Oh noes! algo salió mal</Heading>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Volver a intentar
      </Button>
    </div>
  )
}
