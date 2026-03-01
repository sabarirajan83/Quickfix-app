const statusColor = (status) => {
  if (status === "Pending") return "bg-yellow-100 text-yellow-800";
  if (status === "In Progress") return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
};

export default function TicketCard({ ticket, isAdmin, onStatusChange }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{ticket.title}</h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(ticket.status)}`}
        >
          {ticket.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">
        🏠 Room: <strong>{ticket.roomNumber}</strong> &nbsp;|&nbsp; 🗂{" "}
        {ticket.category}
      </p>
      {isAdmin && ticket.resident && (
        <p className="text-sm text-gray-500 mb-1">
          👤 {ticket.resident.name} — {ticket.resident.email}
        </p>
      )}
      <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
      {isAdmin && (
        <select
          value={ticket.status}
          onChange={(e) => onStatusChange(ticket._id, e.target.value)}
          className="mt-3 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      )}
    </div>
  );
}
