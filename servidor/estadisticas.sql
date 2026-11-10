CREATE TABLE IF NOT EXISTS eventos (
  dia TEXT NOT NULL,
  tipo TEXT NOT NULL,
  detalle TEXT NOT NULL,
  dispositivo TEXT NOT NULL,
  total INTEGER NOT NULL,
  PRIMARY KEY (dia, tipo, detalle, dispositivo)
);
