export function resetPassword(props: { name: string; resetUrl: string }) {
  return {
    subject: "Resetar sua senha — Olympia",
    text: `Olá, ${props.name}!\n\nPara resetar sua senha, clique no link:\n${props.resetUrl}\n\nSe você não pediu, ignore este email.`,
    html: `<p>Olá, <strong>${props.name}</strong>!</p>
<p>Para resetar sua senha, clique no link:</p>
<p><a href="${props.resetUrl}">${props.resetUrl}</a></p>
<p><small>Se você não pediu, ignore este email.</small></p>`,
  };
}
