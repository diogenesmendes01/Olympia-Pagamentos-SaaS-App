export function magicLink(props: { linkUrl: string }) {
  return {
    subject: "Seu link de acesso — Olympia",
    text: `Clique pra entrar:\n${props.linkUrl}\n\nO link expira em 10 minutos.`,
    html: `<p>Clique pra entrar:</p>
<p><a href="${props.linkUrl}">${props.linkUrl}</a></p>
<p><small>O link expira em 10 minutos.</small></p>`,
  };
}
