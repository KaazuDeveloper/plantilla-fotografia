import type { Foto } from "./sitio";

const f = (id: string, ancho: number, alto: number, categoria: string, alt: string): Foto => ({
  src: `https://images.unsplash.com/photo-${id}?auto=format&q=80&w=2400`,
  ancho,
  alto,
  categoria,
  alt,
});

/* Se usa hasta que el cliente tenga sus propias fotos (ver scripts/preparar-fotos.mjs). */
export const galeriaEjemplo: Foto[] = [
  f("1606216794079-73f85bbd57d5", 4480, 6720, "Bodas", "Novios abrazados bajo el velo"),
  f("1531746020798-e6953c6e8e04", 2550, 3188, "Retratos", "Retrato de una mujer sobre fondo rosa"),
  f("1628705250580-80b96d4657f6", 5472, 3648, "Familias", "Familia mirando al horizonte en el campo"),
  f("1519741497674-611481863552", 6720, 4480, "Bodas", "Ramo de novia a contraluz"),
  f("1534528741775-53994a69daeb", 3276, 4096, "Retratos", "Retrato con luz azul"),
  f("1546032996-6dfacbacbf3f", 3705, 5220, "Bodas", "Novios besándose en un campo de trigo"),
  f("1770196567087-b59ba06aef12", 3456, 4608, "Familias", "Familia caminando por una colina"),
  f("1460978812857-470ed1c77af0", 6256, 3648, "Bodas", "Novios en blanco y negro junto al mar"),
  f("1526510747491-58f928ec870f", 3638, 5457, "Retratos", "Mujer pelirroja junto a una pared"),
  f("1760084836111-b384c6d32104", 3648, 5472, "Familias", "Padre abrazando a su hija en el campo"),
  f("1591604466107-ec97de577aff", 5861, 3907, "Bodas", "Novios junto a un lago"),
  f("1438761681033-6461ffad8d80", 5184, 3456, "Retratos", "Retrato junto a un lago"),
  f("1606216794074-735e91aa2c92", 4480, 6720, "Bodas", "Novios bajo una palmera"),
  f("1531123897727-8f129e1688ce", 4000, 6000, "Retratos", "Retrato de una mujer con camisa blanca"),
  f("1768509196851-16084e78f6ac", 4191, 4000, "Familias", "Familia paseando entre hojas secas"),
  f("1561287495-a3fe1fd28504", 3376, 6000, "Bodas", "Novios cogidos de la mano"),
  f("1552699611-e2c208d5d9cf", 2760, 3153, "Retratos", "Retrato de una mujer de pelo oscuro"),
  f("1542037104857-ffbb0b9155fb", 6977, 5372, "Familias", "Familia jugando en un campo"),
  f("1550784718-990c6de52adf", 3399, 5140, "Bodas", "Novios en un mirador"),
  f("1771785990203-eeecb23ff762", 4672, 7008, "Familias", "Madre levantando a su hijo en el aire"),
  f("1638202948587-ac48463ddb1f", 6000, 4000, "Familias", "Familia sonriendo en el bosque"),
  f("1596457221755-b96bc3a6df18", 2533, 3800, "Bodas", "Novios abrazados en la nieve"),
];
