/**
 * Calcula o prazo de entrega dinâmico
 * @param minDays - Número mínimo de dias (padrão: 3)
 * @param maxDays - Número máximo de dias (padrão: 7)
 * @returns Objeto com as datas de início e fim formatadas
 */
export const getDeliveryDateRange = (minDays = 3, maxDays = 7) => {
  const today = new Date();
  
  // Adiciona os dias mínimos e máximos
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);
  
  // Formata as datas no formato brasileiro (ex: "10 de nov.")
  const formatDate = (date: Date) => {
    const months = [
      'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
      'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    
    return `${day} de ${month}`;
  };
  
  return {
    minDate: formatDate(minDate),
    maxDate: formatDate(maxDate),
    formatted: `${formatDate(minDate)} e ${formatDate(maxDate)}`
  };
};
