INSERT INTO usuario (nombre, email, password_hash) VALUES
  ('Administrador Municipal', 'admin@muni.cl', 'scrypt$16384$8$1$4997bbbfec7c1d55a232df46220c5155$3377f649110de2eb786d4706d0c487d0c7a3310558611fb4f4ac7e546aee6ea6c4117d477d86865f42ceaf3dab14b5bbb887ce870c6cd4001bbe0e407db99b82'),
  ('Usuario Municipal', 'usuario@muni.cl', 'scrypt$16384$8$1$88d449aa0ff5cd562ba78bdd72b22bcd$e5818da2314ba68cf7ef0c1420df8a9069c8a193530929ba24ba9bfd61a154c71995d6870e8c617e374b65307b4b06f1ffddf7b9f9ab670edbcb94283d7f1383');

INSERT INTO rol_usuario (id_rol, id_usuario)
SELECT r.id_rol, u.id_usuario
FROM rol r
JOIN usuario u ON u.email = 'admin@muni.cl'
WHERE r.nombre = 'admin';

INSERT INTO rol_usuario (id_rol, id_usuario)
SELECT r.id_rol, u.id_usuario
FROM rol r
JOIN usuario u ON u.email = 'usuario@municipal.cl'
WHERE r.nombre = 'director';

--------------------------------------------------------
en caso de rol de usuario:

INSERT INTO rol_usuario (id_rol, id_usuario)
SELECT r.id_rol, u.id_usuario
FROM rol r
JOIN usuario u ON u.email = 'usuario@muni.cl'
WHERE r.nombre = 'director';

-------------------------------------------------------
contraseñas:
"admin123" 
"muni123"