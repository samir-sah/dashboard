import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "-";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getSupportStats = async () => {
  const response = await apiFetch(API_CONFIG.endpoints.supportKPIs);
  return response.data;
};

export const getTickets = async (params = {}) => {
  const { page = 1, limit = 10, search = '', status = 'All', priority = 'All', sortBy = 'updatedAt', sortOrder = 'desc' } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (search.trim()) queryParams.append('search', search.trim());
  if (status && status !== 'All') queryParams.append('status', status);
  if (priority && priority !== 'All') queryParams.append('priority', priority);

  const response = await apiFetch(`${API_CONFIG.endpoints.supportTickets}?${queryParams.toString()}`);
  const tickets = response.data || [];

  return {
    total: response.total || 0,
    page: response.page || page,
    pages: response.pages || 1,
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      issue: ticket.issue,
      subject: ticket.subject || ticket.issue || "-",
      customer: { name: ticket.customer?.name || "Unknown" },
      priority: ticket.priority,
      status: ticket.status,
      updatedAt: formatRelativeTime(ticket.updatedAt),
    })),
  };
};

export const getTicketById = async (ticketId) => {
  const response = await apiFetch(API_CONFIG.endpoints.supportTicketById(ticketId));
  const ticket = response.data;

  return {
    id: ticket.id,
    issue: ticket.issue,
    subject: ticket.description,
    description: ticket.description,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    source: ticket.source || "Customer Support Portal",
    dueDate: ticket.dueDate,
    resolutionNotes: ticket.resolutionNotes || "-",
    assignedEngineer: ticket.assignedEngineer || "Unassigned",
    createdAt: ticket.createdAt,
    updatedAt: formatRelativeTime(ticket.updatedAt),
    customer: {
      name: ticket.customer?.name || "Unknown",
      email: ticket.customer?.email || "N/A",
      phone: ticket.customer?.phone || "N/A",
      id: ticket.customer?.id || "-",
      address: ticket.customer?.address || "Not provided",
    },
    device: ticket.device
      ? {
          orderId: ticket.device.orderId || "-",
          name: ticket.device.name || "-",
          sku: ticket.device.sku || "-",
          serialNumber: ticket.device.serialNumber || null,
          purchaseDate: ticket.device.purchaseDate || null,
          warrantyStatus: ticket.device.warrantyStatus || "Not Available",
          warrantyValidTill: ticket.device.warrantyValidTill || null,
        }
      : null,
    timeline: (ticket.timeline || []).map((entry, index) => ({
      id: index + 1,
      action: entry.action,
      description: entry.description || "-",
      date: entry.date,
      actor: entry.actor || "System",
    })),
  };
};

export const getSupportEngineers = async () => {
  const response = await apiFetch(API_CONFIG.endpoints.supportEngineers);
  return response.data || [];
};

export const createTicket = (payload) =>
  apiFetch(API_CONFIG.endpoints.supportCreateTicket, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const assignTicket = (ticketId, assignedTo) =>
  apiFetch(API_CONFIG.endpoints.supportAssignTicket(ticketId), {
    method: 'PUT',
    body: JSON.stringify({ assignedTo }),
  });

export const updateTicketStatus = (ticketId, payload) =>
  apiFetch(API_CONFIG.endpoints.supportUpdateStatus(ticketId), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const addTicketNote = (ticketId, description) =>
  apiFetch(API_CONFIG.endpoints.supportAddNote(ticketId), {
    method: 'POST',
    body: JSON.stringify({ description }),
  });

export const resolveTicket = (ticketId, resolutionNotes) =>
  apiFetch(API_CONFIG.endpoints.supportResolveTicket(ticketId), {
    method: 'PUT',
    body: JSON.stringify({ resolutionNotes }),
  });
