"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:8000/api/v1/tickets/admin/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await axios.patch(`http://127.0.0.1:8000/api/v1/tickets/${id}/status`, { status }, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    fetchTickets(); // Refresh list
  };

  useEffect(() => { fetchTickets(); }, []);

  if (loading) return <div className="p-10">Loading Tickets...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>
      <div className="grid gap-4">
        {tickets.map((ticket: any) => (
          <div key={ticket._id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  ticket.ticket_status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {ticket.ticket_status}
                </span>
                <span className="text-gray-400 text-xs">ID: {ticket._id}</span>
              </div>
              <p className="font-medium text-gray-800">{ticket.message}</p>
              <p className="text-sm text-gray-500">Sentiment Score: {ticket.sentiment_score?.toFixed(2) || 'N/A'}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => updateStatus(ticket._id, 'resolved')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-200"
                title="Mark as Resolved"
              >
                <CheckCircle size={20} />
              </button>
              <button 
                onClick={() => updateStatus(ticket._id, 'in_progress')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                title="Mark In Progress"
              >
                <Clock size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}