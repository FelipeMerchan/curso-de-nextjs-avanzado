"use client"

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

import { login } from "./actions"
import { Hint } from "./hint"

export default function I18nPage() {
  /* Los server actions los podemos utilizar de 2 formas:
  1. Donde simplemente pasamos el server action (en este caso es login) al
  formulario: <form action={login}>.
  2. A través de useActionState para manejar los errores de la aplicación.
  useActionState va a recibir cuál es la acción que queremos realizar (en este caso es login y tiene
  que ser un server action) y nos va a devolver en un array lo siguiente: state (state es el objeto
  que deberíamos retornar dentro de nuestro método/action llamado login) y la acción (dispatch) que
  le debemos pasar a nuestro formulario: <form action={action}>
  useActionState is a Hook that allows you to update state based on the result of a form action.
  */
  const [state, action] = useActionState(login, { error: "" })
  /* Con los form actions hay una particularidad y es solo tenemos el action para el formulario y
  state para saber si hay un error, pero no nos da información del estado de carga.
  Para esto podemos usar useFormStatus, la forma de usarlo es importarlo desde react-dom. React por debajo
  le dice cuál es la actión por lo cuál sabe que login es el método que se va a disparar y sabe si
  ha terminado de ejecutarse o no. useFormStatus retorna el status del formulario, status tiene las siguientes
  propiedades:
  {
    pending: boolean; <- indica si la action se está ejecutando o no en nuestro servidor
    data: FormData;
    method: string;
    action: string | ((formData: FormData) => void | Promise<void>);
  }
  .
  */
  const status = useFormStatus()

  return (
    <main className="">
      <header className="my-10">
        <Heading as="h1" size="lg" className="">
          Autenticación
        </Heading>
        <Text fontSize="md">
          En este página exploramos Middleware y Cookies para crear una
          autenticación con Next.js
        </Text>
      </header>

      <form
        /* El server action es la utilidad que estamos trayendo desde el servidor y ejecutando
      a través del formulario: */
        action={action}
        className="p-6 border-2 max-w-xl mx-auto my-10 space-y-4"
      >
        <Heading size="md" className="">
          Login
        </Heading>

        <FormControl
          isDisabled={status.pending}
          isInvalid={Boolean(state.error)}
        >
          <Input
            autoFocus
            autoComplete="off"
            type="password"
            name="pwd"
            pr="3.8rem"
            placeholder="Cuentame un secreto"
          />
        </FormControl>
        <div className="flex items-center space-x-4">
          <Button type="submit" isLoading={status.pending}>
            Ingresar
          </Button>
          <Hint />
        </div>
        {/* Con state podemos manejar los errores al momento en que se haga submit del formulario: */}
        {state.error && (
          <>
            <FormErrorMessage>{state.error}</FormErrorMessage>
            <Alert status="info" className="mt-4">
              <AlertIcon />
              <div>
                <AlertTitle>Pista</AlertTitle>
                <AlertDescription>El lema de Platzi</AlertDescription>
              </div>
            </Alert>
          </>
        )}
      </form>
    </main>
  )
}
