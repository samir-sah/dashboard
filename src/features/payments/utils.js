export const getSimplifiedStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'captured': return 'Paid';
    case 'failed': return 'Failed';
    case 'pending':
    case 'authorized':
    case 'created': return 'Pending';
    case 'refunded':
    case 'partially_refunded': return 'Refunded';
    default: return status || 'Unknown';
  }
};
