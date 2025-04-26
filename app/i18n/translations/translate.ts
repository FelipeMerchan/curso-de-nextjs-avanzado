"server only"
/* Esto debe ser únicamente en el servidor  */

/* Los diccionarios normalmente los tenemos en nuestro código o los traemos
desde otros programas en los cuales personas del negocio, que no son desarrolladores,
tienen acceso para poder modificar los textos. Aquí simulamos que los traemos desde un json: */
const dictionaries: Record<string, () => Promise<Record<string, string>>> = {
  es: () => import("./es.json").then((module) => module.default),
  /* usamos una función () => para que unicamente se importe cuando
  lo ejecutemos (await dictionaries[lang]()), es decir, en el servidor si no usaramos
  la función () => siempre se haría un import de todos los locales de el objeto dictionaries,
  pero solo vamos a necesitar 1, por lo cual, si el valor es la definición de una
  función no se va a realizar el import de todos los diccionarios. */
  en: () => import("./en.json").then((module) => module.default),
}

export async function getTranslations(lang: string) {
  /* Aquí solo importamos el diccionario que nos indique lang, por ello
  ejecutamos el método de dictionaries[lang](), si no usaramos las funciones
  en la propiedades 'es' y 'en' de dictionaries tendríamos un golpe en el performance
  debido a que estaríamos importando siempre todos los diccionarios disponibles
  de la aplicación cuando realmente solo necesitamos 1. Por ello es muy importante
  que usemos una función en cada propiedad de dictionaries:
  const dictionaries: Record<string, () => Promise<Record<string, string>>> = {
    es: () => import("./es.json").then((module) => module.default),
    en: () => import("./en.json").then((module) => module.default),
  }
  */
 /* Gracias a Next.js y los react server components podemos coger de forma
 muy especifica el diccionario que necesitamos, cargarlo en el servidor, renderizar el HTML
 y el enviarle esto al usuario.  */
  const dictionary = await dictionaries[lang]()

  const t = (key: string, defaultValue = ""): string => {
    return dictionary[key] || defaultValue
  }

  /* Intl viene nativo en Node.js y dentro del navegador. */
  const numberFormatter = new Intl.NumberFormat(lang).format
  const f = (n: number): string => {
    return numberFormatter(n)
  }

  const dateFormatter = new Intl.DateTimeFormat(lang).format
  const d = (date: Date): string => {
    return dateFormatter(date)
  }

  return { t, f, d }
}
