export function formatCurrency(value: number) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDate(value: string) {
  if (!value) return 'Não informada';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('pt-BR');
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Horário não informado'
    : date.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

export function classification(value: number) {
  const labels: Record<number, string> = {
    0: 'Livre',
    10: '10 anos',
    12: '12 anos',
    14: '14 anos',
    16: '16 anos',
    18: '18 anos',
  };
  return labels[value] ?? 'Não informada';
}
