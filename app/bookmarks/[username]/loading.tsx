/* También le podemos decir a React que a través de Next.js pueda
hacer un Suspense a toda la página, esto a través del archivo loading.tsx.
loading.tsx es un nombre de archivo que está reservado en Next.js para usar suspense
con las páginas. Cada página puede tener un loading.tsx, es por ello que
podríamos tener páginas que son anidadas y colcoar un loading en cada nivel que queramos
por ejemplo para un loading en bookmarks->[username] podríamos tener un loading.tsx
que aplicaría para esta página y todas sus subpáginas, pero también podríamos tener un
loading.tsx en bookmars y este último aplicaría para todas las subpáginas de bookmarks y la misma página bookmarks.

loading.tsx lo que realmente hace es un Suspense para toda la página.

* Nota
Es recomendado que si manejamos grandes datos y datos asíncronos, tanto que los traigamos del cliente como del
servidor, que utilicemos Suspense para que React y Next.js nos ayuden a mejorar el renderizado dela mejor manera para
nuestros usuarios. Es importante resaltar que no necesariamente todas las páginas deberían tenerlo, dependiendo
de qué tan rápido renderice nuestra información (esto únicamente lo sabremos midiendo el performance de nuestra página)
podría ser o no necesario mostrar un spinner. No se trata de llenar de spinners nuestras páginas, debemos ser muy intencionales
con la forma en que brindamos esta experiencia.
*/
export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* h1 */}
      <div className="h-8 w-60 rounded bg-slate-200 animate-pulse mb-4" />
      {/* username badge */}
      <div className="h-28 w-72 rounded bg-slate-200 animate-pulse mb-4" />
      <div className="h-5 w-96 rounded bg-slate-200 animate-pulse mb-2" />
      {/* h2 */}
      <div className="h-8 w-56 rounded bg-slate-200 animate-pulse mt-14" />
      {/* List */}
      <ul className="mt-8">
        {[1, 2, 3, 4, 5].map((id) => (
          <li className="border-b-2 py-4 px-6 my-2" key={id}>
            <div className="h-7 w-full rounded bg-slate-200 animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  )
}
