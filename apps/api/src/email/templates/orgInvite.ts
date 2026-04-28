export function orgInvite(props: {
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
}) {
  return {
    subject: `Convite para ${props.organizationName} — Olympia`,
    text: `${props.inviterName} convidou você pra ${props.organizationName}.\n\nAceite clicando no link:\n${props.inviteUrl}`,
    html: `<p><strong>${props.inviterName}</strong> convidou você pra <strong>${props.organizationName}</strong>.</p>
<p><a href="${props.inviteUrl}">Aceitar convite</a></p>`,
  };
}
