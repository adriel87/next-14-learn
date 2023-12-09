# Tips y cositas de next 14

- [configuraciones](#configuraciones)
- [estilos](#estilos)
- [fuentes](#fuentes)
- [imagenes](#imagenes)
- [fetching](#fetching)
- [streaming](#streaming)
- [partial prerendering](#partial-prerendering)
- [react server action](#react-server-action)
- [Errores](#errores)


## configuraciones
### next.config

podemos indicar que rutas son validas con la siguiente configuracion

```js
const nextConfig = {
    experimental:{
        typedRoutes: true,
    },
}
```

aunque este en experimental no es algo que nos vaya a romper el proyecto. Luego cuando vayamos a hacer uso de el componente `Link` de next seremos capaces de visualizar si nos estamos equivocando a la hora de indicar la ruta.


## estilos

### importar de forma general
es buena practica que carguemos los estilos globales o reseteos de css en la parte mas alta de nuestra aplicacion.

para ello si estamos usando el app router podemos usar el layout principal como punto de carga de nuestros estilos.

```jsx
// !! importandolo de la siguiente forma seremos capaces de estilar nuestra app
import '@/app/ui/global.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

```

### modulos CSS 

los modulos CSS nos brindan la posibilidad de trabajar con los estilos como si de objetos se trataran

primero definimos nuestra hoja de estilo

```css
/* nuestra clase */

.red {
    color: red;
}

```

y ahora vamos a importarlo en el componente que necesitemos

```jsx

import styles from '@/app/ui/home.module.css';

// 
<p classname={styles.red} > ahora sere rojo </p>
//

```

### trabajando las clases con condiciones CLSX

clsx es una libreria que nos permite de forma facil usar un estilo en base a un estado o una propiedad

veamos un ejemplo sencillo

```jsx
import clsx from 'clsx';
 
export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-sm',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
    // ...
)}
```

### otras formas de estilar nuestra aplicacion

- Sass
- usando CSS a traves de librerias, ejemplos:
  -  [styled-jsx](https://github.com/vercel/styled-jsx)
  -  [styled-components](https://github.com/vercel/next.js/tree/canary/examples/with-styled-components)
  -  [emotion](https://github.com/vercel/next.js/tree/canary/examples/with-emotion)


## Fuentes

En next si hacemos uso de `next/fonts` seremos capaces de guardar en build time nuestras fuentes como cualquier otro asset, esto evitara que nuestros usuarios necesiten de realizar otras llamadas extra para traerse la informacion de la fuente requerida

### como importamos nuestras fuentes

podemos crearnos un archivo de fuentes para luego usarlo donde lo necesitemos como por ejemplo en el layout

```jsx
// primero creamos nuestro archivo  font.ts
import { Inter } from 'next/font/google'

export const inter = Inter( { subsets: ['latin'] } )
```

ahora lo importamos al nivel que necesitemos por en este caso la fuente sera aplicada a toda la app

asi que vamos importarla en layout.tsx del root

```jsx
import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        {/* aqui next opta por un uso similar a los modulos de css */}
      <body className={`${inter.className} antialiased`} >{children}</body>
    </html>
  );
}
```
## imagenes

si usamos el componente de `image` de next nos hara la vida mas facil con el manejo de la imagenes en nuestra app


## fetching

### parallel fetching

muchas veces cuando realizamos el fetching de datos en nuestras aplicaciones solemos hacer las peticiones y esperar a que estas terminen para luego mostrar la informacion, el problema de esto es que hay datos que nos llegaran antes que otros y estaran bloqueados hasta que todo se haya resuelto.

esto lo podemos solucionar realizando las peticiones en paralelo, para ello javascript nos proporciona las promesas, en concreto el `Promise.all`

esto ejecutara todas las promesas a la vez

## rendering

proceso en el que vamos a construir una pagina y este puede ser estatico o dinamico

### static

el renderizado estatico pasa en nuestro backend, por que basicamente es el que se encarga de conseguir los datos y luego contruir la pagina que nos va servir.

este tipo de renderizado tiene varias ventajas como:

- cachear las respuestas, lo que hace que nuestros sitios web sean mas rapidos
- reduce la carga en el backend
- mejora el SEO

pero tenemos un problema, no siempre podemos realizar un fetching de datos completamente ajenos al usuario o por ejemplo cuando los datos que se generamos se actualizan frecuentemente

### dinamic

el renderizado dinamico se realiza cuando un usuario de nuestra app realiza una peticion, es entonces cuando nuestro backend tiene que hacer lo necesario para servir la informacion en cuestion

cosas buenas del renderizado dinamico:

- datos actualizados
- informacion especifica para un usuario en concreto
- podemos obtener informacion de las peticiones que que se realizan desde el usuario

## streaming

el `streaming` es una tecnica que nos permite romper algo en trozitos y luego ir transmitiendo esos trozitos de forma progresiva.

Si usamos streaming podemos evitar el bloqueo producido cuando hacemos dinamic rendering y nuestra pagina queda `colgada` por la peticion mas lenta, por que a medida que vamos con fecheando los datos vamos a ir entregando esos trocitos de pagina para que puedan ser renderizadas de forma parcial en el navegador

> React con los server components funciona muy bien por que podemos tratar cada uno de esos componentes como los trocitos de nuestro streaming de datos

### como implementarlo

- loading.tsx/jsx, este archivo nos mostrara lo que nostros necesitemos hasta que no se carguen los datos
- para un componente en especifico podemos usar el `Suspense` de react

#### loading

el archivo `loading` tenemos que usarlo al mismo nivel de nuestro page.tsx/jsx

```tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

el loading es un lugar perfecto para incluir los skeletos de nuestras paginas

#### suspense

react nos provee de un componente para nuestros server components ==> `Suspense`

con el podemos envolver los componentes que van a realizar un fetching de datos e incluir que queremos renderizar mientras estamos a la espera de los datos

***Cuando usar suspense ?***
- cuando queremos que la experiencia de usuario no se vea detenida por una o varias peticiones, podemos particionar esas peticiones en diversos componentes de servidor


## partial prerendering

aunque de momento es algo que esta en experimental en next 14, se trata de tratar una misma pagina tanto de forma estatica como dinamica, con next podemos determinar que hacer en cada caso.

## react server action


### que son
para resumirlo mucho son acciones(metodos) que se ejecutan del lado del servidor, pero en apariencia lo usamos en el cliente.

Las server action pueden ser llamadas tanto desde el cliente como desde servidor, hablando siempre de componentes de next

Los server accion ayudan a mejorar la seguridad de nuestra app

### como usarlos

para empezar podemos crear un archivo donde tendremos nuestros server actions por ejemplo `action.ts`, IMPORTANTE la primera linea de ese archivo debe incluir la directiva de react que nos indica que el archivo va a contener server actions `use server`. 

podemos crear tambien server action dentro de server component, siempre usarlo dentro de una funcion declarada en el server component y en su interior al comienzo de la declaracion tenemos que usar la directiva anterior `use server` 

EJEMPLOS:

- archivo dedicado a server actions

actions.ts
```ts
'use server'

export const insertInDataBase = async () => {
  // ...
  do something
  // ..
}
```

- dentro de un server component

page.tsx

```tsx
export default function Page(){
  
  async function create(formData: FormData) {
    'use server'
    // do somenthing
  }

  return <form action={create}> your form </form>

}
```

## Errores

aqui solo vamos a ver las peliculiaridades de como se puede llegar a usar el manejo de exceptciones de javascript en Next.

Por defecto next envuelve toda la aplicacion en una especie de bloque try/catch, esto nos da mientras estamos en desarrollo la capacidad de ver cuando nuestro codigo peta por un error no controlado

### error.ts

el archivo `error.ts` nos permite mostrar una pagina cuando se de un error no controlado en nuestra aplicacion, podemos usarlo a nivel general o hilar un poco mas fino si lo colocamos en la raiz de nuestras rutas.


