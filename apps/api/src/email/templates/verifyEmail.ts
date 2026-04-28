export function verifyEmail(props: { name: string; verifyUrl: string }) {
  return {
    subject: "Confirme seu email — Olympia",
    text: `Olá, ${props.name}!\n\nConfirme seu email clicando no link:\n${props.verifyUrl}\n\nO link expira em 24 horas.`,
    html: `<p>Olá, <strong>${props.name}</strong>!</p>
<p>Confirme seu email clicando no link:</p>
<p><a href="${props.verifyUrl}">${props.verifyUrl}</a></p>
<p><small>O link expira em 24 horas.</small></p>`,
  };
}
