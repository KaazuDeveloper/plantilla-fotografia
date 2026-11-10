/*
 * Todo el texto de la web está aquí. Para adaptarla a un cliente solo hay que
 * cambiar este archivo y sus fotos: ver README.md.
 */

/* Fotos de ejemplo de Unsplash. Las del cliente van en /public, p. ej. "/portada/1.jpg". */
const ejemplo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&q=80&w=2400`;

export const sitio = {
  /* En modo ejemplo los formularios no envían nada y se avisa de que el contenido es ficticio. */
  demo: true,

  nombre: "Estudio Olivo",
  lema: "Fotografía de bodas, retratos y familias en Córdoba.",
  descripcion:
    "Fotografía de bodas, retratos y familias en Córdoba. Reportajes naturales, sin poses forzadas y con entrega en galería privada.",
  url: "https://plantilla-fotografia.vercel.app",
  colorAcento: "#b4552d",
  anio: 2026,

  contacto: {
    email: "hola@ejemplo.com",
    telefonoVisible: "600 000 000",
    /* Con prefijo y sin espacios: 34600000000 */
    whatsapp: "34600000000",
    instagram: "https://www.instagram.com/",
    instagramUsuario: "@tuestudio",
    zona: "Córdoba y alrededores",
  },

  portada: [
    { src: ejemplo("1532712938310-34cb3982ef74"), alt: "Pareja de novios caminando por una colina al atardecer" },
    { src: ejemplo("1520854221256-17451cc331bf"), alt: "Novios cogidos de la mano sobre la hierba" },
    { src: ejemplo("1542037104857-ffbb0b9155fb"), alt: "Familia jugando en un campo" },
  ],

  servicios: [
    {
      nombre: "Bodas",
      precio: "Desde 1.200 €",
      texto: "Te acompaño durante todo el día, sin interrumpir y sin que tengas que estar pendiente de la cámara.",
      incluye: ["Hasta ocho horas de reportaje", "Unas 400 fotos editadas", "Galería privada para compartir", "Sesión previa de pareja"],
      foto: ejemplo("1606216794079-73f85bbd57d5"),
      alt: "Novios abrazados bajo el velo",
    },
    {
      nombre: "Retratos",
      precio: "Desde 120 €",
      texto: "Para tu web, tu trabajo o simplemente para tener una foto en la que te reconozcas.",
      incluye: ["Una hora de sesión", "15 fotos editadas", "Asesoramiento de ropa y lugar", "Entrega en una semana"],
      foto: ejemplo("1506863530036-1efeddceb993"),
      alt: "Retrato en blanco y negro de una mujer",
    },
    {
      nombre: "Familias",
      precio: "Desde 180 €",
      texto: "Una tarde al aire libre, jugando, para guardar cómo sois ahora.",
      incluye: ["Hora y media de sesión", "30 fotos editadas", "Lugar a elegir en la provincia", "Galería privada para compartir"],
      foto: ejemplo("1628705250580-80b96d4657f6"),
      alt: "Padres e hijas mirando al horizonte en el campo",
    },
  ],

  sobre: {
    saludo: "Hola, soy Marta.",
    parrafos: [
      "Llevo diez años haciendo fotos de la gente que importa a otras personas. Me gusta llegar pronto, hablar poco y estar atenta a lo que pasa cuando nadie posa.",
      "Trabajo sola o con una segunda fotógrafa en las bodas grandes, y edito cada foto yo misma para que todo el reportaje tenga la misma luz y el mismo color.",
    ],
    foto: ejemplo("1541516160071-4bb0c5af65ba"),
    alt: "La fotógrafa con su cámara",
    datos: [
      { valor: "10", texto: "años de oficio" },
      { valor: "180", texto: "bodas contadas" },
      { valor: "4 sem.", texto: "de entrega media" },
    ],
  },

  /* Deja la lista vacía si todavía no hay opiniones reales: la sección desaparece. */
  opiniones: [
    { texto: "Nos olvidamos de que estaba allí, y aun así no se perdió ni un momento.", autor: "Ana y Pablo" },
    { texto: "Por fin tengo una foto de mis hijos en la que salen como son.", autor: "Lucía" },
    { texto: "Trato cercano, todo claro desde el primer día y unas fotos preciosas.", autor: "Carmen y Javier" },
  ],

  preguntas: [
    {
      pregunta: "¿Con cuánta antelación debo reservar?",
      respuesta: "Las bodas, entre seis y doce meses antes. Para retratos y familias suele bastar con un par de semanas.",
    },
    {
      pregunta: "¿Cuándo tendré las fotos?",
      respuesta: "Los retratos y las familias en una semana. Las bodas, en unas cuatro semanas, con un adelanto a los pocos días.",
    },
    {
      pregunta: "¿Te desplazas fuera de Córdoba?",
      respuesta: "Sí. Dentro de la provincia no cobro desplazamiento y fuera de ella te lo digo en el presupuesto.",
    },
    {
      pregunta: "¿Cómo se reserva la fecha?",
      respuesta: "Con una señal del 30 %. El resto se paga el día de la sesión o antes de la entrega.",
    },
  ],

  legal: {
    titular: "Nombre y apellidos del titular",
    nif: "00000000X",
    direccion: "Dirección completa",
  },

  credito: { texto: "Web hecha por Juan Caballero", url: "https://juancaballero.vercel.app" },
};

export type Foto = { src: string; ancho: number; alto: number; alt: string; categoria: string };
