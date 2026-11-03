// Envío de correos (SMTP). Si el servidor no tiene SMTP configurado, no falla:
// devuelve { enviado: false, motivo } para que quien llama lo deje registrado.
//
// Variables de entorno: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM.

const nodemailer = require('nodemailer');

let transporte = null;

function obtenerTransporte() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporte) {
    transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporte;
}

async function enviarCorreo({ para, asunto, texto }) {
  const smtp = obtenerTransporte();
  if (!smtp) {
    return { enviado: false, configurado: false, motivo: 'SMTP no configurado (SMTP_HOST vacío)' };
  }

  try {
    await smtp.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: para,
      subject: asunto,
      text: texto,
    });
    return { enviado: true, configurado: true };
  } catch (err) {
    return { enviado: false, configurado: true, motivo: err.message };
  }
}

module.exports = { enviarCorreo };
