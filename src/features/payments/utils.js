export const getSimplifiedStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'captured': return 'Paid';
    case 'failed': return 'Failed';
    case 'authorized':
    case 'created': return 'Pending';
    case 'refunded':
    case 'partially_refunded': return 'Refunded';
    default: return status || 'Unknown';
  }
};
