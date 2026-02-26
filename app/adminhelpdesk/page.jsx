"use client";
import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../lib/api";
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Loader2,
  Lock,
  Database,
  Shield,
  Info,
  Check,
  Filter,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Zap,
  Ticket,
  Users,
  FileText,
  DownloadCloud,
  ThumbsUp,
  Star,
  BadgeCheck,
  Award,
  Crown,
  ShieldCheck,
  Bell,
  FileCode,
  Settings,
  ExternalLink,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Send,
  Upload,
  BarChart3,
  Activity,
  Paperclip,
  File,
  CalendarDays,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function AdminHelpdeskPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [resolvingTickets, setResolvingTickets] = useState({});
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveData, setResolveData] = useState("");

  // Image viewer state
  const [imageViewer, setImageViewer] = useState({
    isOpen: false,
    imageUrl: "",
    fileName: "",
  });

  // Month filter options
  const monthOptions = [
    { value: "ALL", label: "All Time" },
    { value: "THIS_MONTH", label: "This Month" },
    { value: "LAST_MONTH", label: "Last Month" },
    { value: "LAST_3_MONTHS", label: "Last 3 Months" },
  ];

  // Filters - Monthly filter by default
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    user_type: "",
    monthFilter: "THIS_MONTH", // Default: This Month
  });

  // Pagination - Fixed with proper defaults
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token")
    );
  };

  const getUserRole = () => {
    if (typeof window === "undefined") return "user";

    return (
      localStorage.getItem("user_role") ||
      localStorage.getItem("role") ||
      "user"
    );
  };


  // Check if user is admin
  const isAdminUser = () => {
    const role = getUserRole().toLowerCase();
    return ["admin", "superadmin", "administrator"].includes(role);
  };

  // Get the correct ticket ID from the ticket object
  const getTicketId = (ticket) => {
    return (
      ticket.id ||
      ticket.ticket_id ||
      ticket.ticket_number ||
      ticket._id ||
      String(ticket.id || "")
    );
  };


  // Extract user type from created_by string (e.g., "don (retailer)" -> "retailer")
  const extractUserType = (createdByString) => {
    if (!createdByString) return "user";
    const match = createdByString.match(/\(([^)]+)\)/);
    return match ? match[1] : "user";
  };

  // Extract username from created_by string (e.g., "don (retailer)" -> "don")
  const extractUsername = (createdByString) => {
    if (!createdByString) return "Unknown User";
    return createdByString.split(" (")[0] || "Unknown User";
  };

  // Extract solved by username
  const extractSolvedByUsername = (solvedByString) => {
    if (!solvedByString) return "";
    return solvedByString.split(" (")[0] || "";
  };

  // Function to get file name from attachment URL
  const getFileNameFromUrl = (url) => {
    if (!url) return null;
    return url.split('/').pop();
  };

  // Function to check if file is an image
  const isImageFile = (url) => {
    if (!url) return false;
    const fileName = getFileNameFromUrl(url) || '';
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // Function to download attachment
  const downloadAttachment = (url, fileName = null) => {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || getFileNameFromUrl(url) || 'attachment';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImageViewer = (url, fileName) => {
    setImageViewer({
      isOpen: true,
      imageUrl: url,
      fileName: fileName || getFileNameFromUrl(url) || 'Image',
    });
  };

  const closeImageViewer = () => {
    setImageViewer({
      isOpen: false,
      imageUrl: "",
      fileName: "",
    });
  };

  // Function to get date range based on month filter (Client-side filtering)
  const getDateRangeForFilter = (monthFilter) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (monthFilter === "THIS_MONTH") {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (monthFilter === "LAST_MONTH") {
      // Last month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (monthFilter === "LAST_3_MONTHS") {
      // Last 3 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      // ALL - No date filtering
      return null;
    }

    return {
      startDate,
      endDate
    };
  };

  // Function to filter tickets by month (Client-side filtering)
  const filterTicketsByMonth = (ticketsData, monthFilter) => {
    if (monthFilter === "ALL") {
      return ticketsData; // Return all tickets
    }

    const dateRange = getDateRangeForFilter(monthFilter);
    if (!dateRange) return ticketsData;

    const { startDate, endDate } = dateRange;

    return ticketsData.filter(ticket => {
      try {
        const ticketDate = new Date(
          ticket.created_at ||
          ticket.created_date ||
          ticket.date_created ||
          ticket.timestamp
        );

        // Check if ticket date is within the range
        return ticketDate >= startDate && ticketDate <= endDate;
      } catch (error) {
        console.error("Error parsing ticket date:", error);
        return false; // Exclude tickets with invalid dates
      }
    });
  };

  // Function to filter tickets by all criteria (Client-side)
  const applyClientSideFilters = (ticketsData) => {
    let filteredTickets = [...ticketsData];

    // Apply month filter first
    if (filters.monthFilter) {
      filteredTickets = filterTicketsByMonth(filteredTickets, filters.monthFilter);
    }

    // Apply status filter
    if (filters.status) {
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.status && ticket.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply user type filter
    if (filters.user_type) {
      filteredTickets = filteredTickets.filter(ticket => {
        const userType = extractUserType(ticket.created_by);
        return userType.toLowerCase() === filters.user_type.toLowerCase();
      });
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket => {
        return (
          (ticket.service && ticket.service.toLowerCase().includes(searchLower)) ||
          (ticket.description && ticket.description.toLowerCase().includes(searchLower)) ||
          (ticket.created_by && extractUsername(ticket.created_by).toLowerCase().includes(searchLower)) ||
          (getTicketId(ticket).toString().toLowerCase().includes(searchLower))
        );
      });
    }

    return filteredTickets;
  };

  // Fetch tickets from API - Get all tickets initially
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setAuthError(false);

      const token = getAuthToken();
      const role = getUserRole();
      setUserRole(role);

      if (!token) {
        setAuthError(true);
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      // API call to get ALL tickets
      const apiUrl = `${BASE_URL}helpdesk/list_tickets/`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.status === 401) {
        setAuthError(true);
        throw new Error(
          "Authentication failed. Token may be expired or invalid."
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setApiData(data);

      // Handle different API response structures
      let ticketData = [];
      let total = 0;

      if (Array.isArray(data)) {
        ticketData = data;
        total = data.length;
      } else if (data.tickets && Array.isArray(data.tickets)) {
        ticketData = data.tickets;
        total = data.total || data.count || data.tickets.length;
      } else if (data.results && Array.isArray(data.results)) {
        ticketData = data.results;
        total = data.count || data.total || data.results.length;
      } else if (data.data && Array.isArray(data.data)) {
        ticketData = data.data;
        total = data.total || data.count || data.data.length;
      } else if (typeof data === "object") {
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
          ticketData = values[0];
          total = values[0].length;
        }
      }

      // Store all tickets
      setTickets(ticketData);

      // Set pagination
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: total,
        pages: Math.ceil(total / prev.limit),
      }));

    } catch (err) {
      console.error("❌ Error fetching tickets:", err);
      setError(err.message || "Failed to load tickets from API");

      // Show empty state on error
      setTickets([]);
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: 0,
        pages: 1,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and paginate
  const getPaginatedTickets = () => {
    // Apply client-side filters
    const filteredTickets = applyClientSideFilters(tickets);

    // Calculate pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;

    // Get tickets for current page
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    // Update total count for filtered tickets
    const filteredTotal = filteredTickets.length;
    const totalPages = Math.ceil(filteredTotal / pagination.limit);

    // Update pagination state if needed
    if (pagination.total !== filteredTotal || pagination.pages !== totalPages) {
      setPagination(prev => ({
        ...prev,
        total: filteredTotal,
        pages: totalPages,
      }));
    }

    return paginatedTickets;
  };

  // Open resolve modal
  const openResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setResolveData("");
    setShowResolveModal(true);
  };

  // Close resolve modal
  const closeResolveModal = () => {
    setShowResolveModal(false);
    setResolveData("");
  };

  // Update ticket status WITH RESOLUTION DETAILS
  const updateTicketStatus = async (ticketId, newStatus, resolutionDetails = null) => {
    try {
      const token = getAuthToken();

      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      if (!ticketId) {
        alert("Invalid ticket ID");
        return;
      }

      // Set resolving state for this ticket
      setResolvingTickets((prev) => ({ ...prev, [ticketId]: true }));

      // Check if user is trying to solve a ticket (admin-only action)
      if (
        newStatus === "SOLVED" ||
        newStatus === "solved" ||
        newStatus === "resolved"
      ) {
        // Check if user is admin
        if (!isAdminUser()) {
          alert("❌ Permission Denied: Only admins can mark tickets as solved");
          setResolvingTickets((prev) => ({ ...prev, [ticketId]: false }));
          return;
        }

        // Use the correct solve endpoint from your API documentation
        const solveEndpoint = `${BASE_URL}helpdesk/${ticketId}/solve/`;

        // Prepare resolution data
        const resolutionData = {
          admin_notes: resolveData || resolutionDetails || "Ticket resolved by admin",
          solved_by: userRole,
          solved_at: new Date().toISOString(),
        };

        const response = await fetch(solveEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(resolutionData),
        });

        if (response.ok) {
          const result = await response.json();

          // Store resolution details from response
          const resolutionDetailsFromAPI = result.admin_notes || resolveData;

          // Update local state with resolution details
          setTickets((prev) =>
            prev.map((ticket) =>
              getTicketId(ticket) === ticketId
                ? {
                  ...ticket,
                  status: "SOLVED",
                  solved_by: `${userRole} (${userRole})`,
                  solved_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  admin_notes: resolutionDetailsFromAPI, // ✅ Store resolution details
                }
                : ticket
            )
          );

          // Show success notification
          showNotification(
            "success",
            "Ticket marked as solved!",
            "The ticket has been successfully resolved with your message."
          );
        } else if (response.status === 403) {
          const errorData = await response.json();
          showNotification(
            "error",
            "Permission Denied",
            errorData.error || "You do not have permission to solve tickets"
          );
        } else if (response.status === 404) {
          const errorData = await response.json();
          showNotification(
            "error",
            "Error",
            errorData.message || "Ticket not found or already solved"
          );
        } else {
          const errorData = await response.json();
          showNotification(
            "error",
            "Error",
            errorData.message || "Failed to update ticket status"
          );
        }
      }

      // Update local state for better UX
      setTickets((prev) =>
        prev.map((ticket) =>
          getTicketId(ticket) === ticketId
            ? {
              ...ticket,
              status: newStatus,
              updated_at: new Date().toISOString(),
              ...(newStatus === "SOLVED" && {
                admin_notes: resolveData,
              }),
            }
            : ticket
        )
      );

      // Close modal
      closeResolveModal();

      // Clear resolving state
      setResolvingTickets((prev) => ({ ...prev, [ticketId]: false }));
    } catch (err) {
      console.error("Update error:", err);

      // Update local state anyway for better UX
      setTickets((prev) =>
        prev.map((ticket) =>
          getTicketId(ticket) === ticketId
            ? {
              ...ticket,
              status: "SOLVED",
              solved_by: `${userRole} (${userRole})`,
              solved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              admin_notes: resolveData, // ✅ Store resolution details even on error
            }
            : ticket
        )
      );

      showNotification(
        "warning",
        "Status Updated Locally",
        "Network error occurred, but status updated locally."
      );
      closeResolveModal();
      setResolvingTickets((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  // Show notification
  const showNotification = (type, title, message) => {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm animate-slide-in transform transition-all duration-300 ${type === "success"
      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
      : type === "error"
        ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800"
        : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800"
      }`;

    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg ${type === "success"
        ? "bg-green-500"
        : type === "error"
          ? "bg-red-500"
          : "bg-yellow-500"
      }">
          ${type === "success"
        ? '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
        : type === "error"
          ? '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>'
          : '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>'
      }
        </div>
        <div>
          <div class="font-bold">${title}</div>
          <div class="text-sm opacity-90">${message}</div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      notification.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    // Reset to first page
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      search: "",
      user_type: "",
      monthFilter: "THIS_MONTH",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setPagination(prev => ({ ...prev, page }));
    }
  };

  // Status styles
  const statusStyles = {
    open: {
      label: "Open",
      color:
        "bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-700 border border-orange-200",
      icon: AlertCircle,
    },
    OPEN: {
      label: "Open",
      color:
        "bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-700 border border-orange-200",
      icon: AlertCircle,
    },
    resolved: {
      label: "Resolved",
      color:
        "bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 border border-green-200",
      icon: CheckCircle,
    },
    SOLVED: {
      label: "Resolved",
      color:
        "bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 border border-green-200",
      icon: CheckCircle,
    },
    solved: {
      label: "Resolved",
      color:
        "bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 border border-green-200",
      icon: CheckCircle,
    },
    closed: {
      label: "Closed",
      color:
        "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 border border-blue-200",
      icon: CheckCircle,
    },
    CLOSED: {
      label: "Closed",
      color:
        "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 border border-blue-200",
      icon: CheckCircle,
    },
    pending: {
      label: "Pending",
      color:
        "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 text-yellow-700 border border-yellow-200",
      icon: Clock,
    },
    PENDING: {
      label: "Pending",
      color:
        "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 text-yellow-700 border border-yellow-200",
      icon: Clock,
    },
    new: {
      label: "New",
      color:
        "bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 border border-purple-200",
      icon: AlertCircle,
    },
    NEW: {
      label: "New",
      color:
        "bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 border border-purple-200",
      icon: AlertCircle,
    },
  };

  // User type styles
  const userTypeStyles = {
    retailer: {
      label: "Retailer",
      color:
        "bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-700 border border-purple-200",
      icon: Users,
    },
    dealer: {
      label: "Dealer",
      color:
        "bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-700 border border-blue-200",
      icon: Users,
    },
    master: {
      label: "Master",
      color:
        "bg-gradient-to-r from-green-500/10 to-green-500/5 text-green-700 border border-green-200",
      icon: Crown,
    },
    admin: {
      label: "Admin",
      color:
        "bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-700 border border-red-200",
      icon: Shield,
    },
    superadmin: {
      label: "Super Admin",
      color:
        "bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-700 border border-red-200",
      icon: Crown,
    },
    administrator: {
      label: "Administrator",
      color:
        "bg-gradient-to-r from-red-500/10 to-red-500/5 text-red-700 border border-red-200",
      icon: ShieldCheck,
    },
    user: {
      label: "User",
      color:
        "bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 border border-gray-200",
      icon: User,
    },
  };

  // Format date exactly like image (14 Jan 2026, 04:43 pm)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-IN", { month: "short" });
      const year = date.getFullYear();

      // Format time with AM/PM
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateString;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch (e) {
      return "";
    }
  };

  // Format ticket ID
  const formatTicketId = (ticket) => {
    return (
      ticket.id ||
      ticket.ticket_id ||
      ticket.ticket_number ||
      `TKT-${ticket.id}`
    );
  };

  // Count tickets by status (from filtered tickets)
  const countByStatus = (status) => {
    const filteredTickets = applyClientSideFilters(tickets);
    return filteredTickets.filter(
      (ticket) =>
        ticket.status?.toLowerCase() === status.toLowerCase() ||
        ticket.status === status
    ).length;
  };

  // Copy ticket ID to clipboard
  const copyTicketId = (ticket) => {
    const ticketId = formatTicketId(ticket);
    navigator.clipboard.writeText(ticketId);
    showNotification(
      "success",
      "Copied!",
      `Ticket ID ${ticketId} copied to clipboard`
    );
  };

  // Get filtered and paginated tickets
  const displayedTickets = getPaginatedTickets();
  const filteredTotal = pagination.total;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/30 p-4 md:p-6">
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              #f0f0f0 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .text-uppercase {
          text-transform: uppercase;
        }
        .image-viewer-overlay {
          background: rgba(0, 0, 0, 0.9);
        }
        .image-viewer-content {
          max-height: 90vh;
          max-width: 90vw;
        }
        .image-viewer-img {
          max-height: 80vh;
          max-width: 80vw;
          object-fit: contain;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative p-3 bg-white border border-gray-200 rounded-xl shadow-sm backdrop-blur-sm">
                    <Ticket className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Helpdesk Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage customer support requests efficiently
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm ${isAdminUser()
                    ? "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/5 text-green-700 border border-green-200 shadow-sm"
                    : "bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/5 text-blue-700 border border-blue-200 shadow-sm"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {isAdminUser() ? (
                      <Crown className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{userRole || "User"}</span>
                    {isAdminUser() && (
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>

                {isAdminUser() && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/5 text-green-600 rounded-lg border border-green-200 text-sm flex items-center gap-2 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    Admin Privileges
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Filters Section - UPDATED with Month Filter */}
        {!authError && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {filteredTotal} tickets found
                  </div>
                </div>

                <div className="flex gap-3">

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 border border-gray-300 font-medium transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </button>

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <div className="relative">
                    <select
                      value={filters.monthFilter}
                      onChange={(e) => handleFilterChange("monthFilter", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                    >
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                    >
                      <option value="">All Status</option>
                      <option value="OPEN">Open</option>
                      <option value="SOLVED">Solved</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* User Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <div className="relative">
                    <select
                      value={filters.user_type}
                      onChange={(e) => handleFilterChange("user_type", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none"
                    >
                      <option value="">All Users</option>
                      <option value="retailer">Retailer</option>
                      <option value="dealer">Dealer</option>
                      <option value="master">Master</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Search Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {(filters.monthFilter !== "THIS_MONTH" || filters.status || filters.user_type || filters.search) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.monthFilter !== "THIS_MONTH" && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {monthOptions.find(opt => opt.value === filters.monthFilter)?.label}
                      </span>
                    )}
                    {filters.status && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Status: {filters.status}
                      </span>
                    )}
                    {filters.user_type && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        User: {filters.user_type}
                      </span>
                    )}
                    {filters.search && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Search: "{filters.search}"
                      </span>
                    )}
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Authentication Error */}
        {authError && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-50 via-red-100/50 to-red-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">
                  Authentication Required
                </h3>
                <p className="text-red-700 mt-1">
                  Please login to access the helpdesk dashboard.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleLoginRedirect}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-medium shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={() => fetchTickets()}
                    className="px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 border border-red-300 font-medium transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!authError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-white via-blue-50 to-white p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Tickets
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {filteredTotal}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-blue-600 mt-2">
                    <FileText className="h-4 w-4" />
                    Filtered results
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white via-orange-50 to-white p-5 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Open Tickets
                  </p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    {countByStatus("OPEN")}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-orange-600 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    Needs attention
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white via-green-50 to-white p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {countByStatus("solved") + countByStatus("resolved")}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                    <CheckCircle className="h-4 w-4" />
                    Successfully resolved
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white via-purple-50 to-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current Filter</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {filters.monthFilter === "ALL" ? "All Time" :
                      monthOptions.find(opt => opt.value === filters.monthFilter)?.label}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-purple-600 mt-2">
                    <Calendar className="h-4 w-4" />
                    {filters.status || filters.user_type || filters.search ? "Custom Filter" : "Time Period"}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !authError && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 via-red-100/50 to-red-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-red-800">Error Loading Data</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={() => fetchTickets()}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets Table */}
        {!authError && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  All Tickets
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredTotal} filtered tickets)
                  </span>
                </h3>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Showing {displayedTickets.length} of {filteredTotal} tickets
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-16 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DETAILS
                    </th>
                    <th className="px-1 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      CREATED BY
                    </th>
                    <th className="px-7 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      USER TYPE
                    </th>
                    <th className="px-9 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-9 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      SOLVED BY
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      CREATED
                    </th>
                    <th className="px-15 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && displayedTickets.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                          <p className="mt-4 text-gray-600 font-medium">
                            Loading tickets...
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Fetching data from server
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : displayedTickets.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl">
                            <Ticket className="h-12 w-12 text-gray-300" />
                          </div>
                          <p className="mt-4 text-gray-600 font-medium">
                            No tickets found
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {filters.status || filters.user_type || filters.search || filters.monthFilter !== "THIS_MONTH" ?
                              "Try adjusting your filters" :
                              "No tickets available"}
                          </p>
                          <button
                            onClick={resetFilters}
                            className="mt-4 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedTickets.map((ticket, index) => {
                      const ticketId = getTicketId(ticket);
                      const userTypeKey = extractUserType(ticket.created_by);
                      const userType = userTypeStyles[userTypeKey] || {
                        label: userTypeKey,
                        color:
                          "bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 border border-gray-200",
                        icon: User,
                      };
                      const statusKey = ticket.status || "open";
                      const statusStyle =
                        statusStyles[statusKey] || statusStyles.open;
                      const StatusIcon = statusStyle.icon;
                      const isResolved =
                        ticket.status === "SOLVED" ||
                        ticket.status === "solved" ||
                        ticket.status === "resolved" ||
                        ticket.status === "CLOSED" ||
                        ticket.status === "closed";
                      const isResolving = resolvingTickets[ticketId];

                      return (
                        <tr
                          key={ticketId || index}
                          className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:via-white hover:to-gray-50/50 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-semibold text-center">
                              {ticketId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="font-semibold text-gray-900">
                                {ticket.service || ticket.title || "No Service"}
                              </div>
                              {ticket.description && (
                                <div className="text-sm text-gray-500 truncate max-w-[200px] mt-1">
                                  {ticket.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {extractUsername(ticket.created_by)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${userType.color}`}
                              >
                                {userType.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusStyle.color}`}
                              >
                                {statusStyle.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {ticket.solved_by ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-gray-900 font-medium">
                                  {extractSolvedByUsername(ticket.solved_by)}
                                </span>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm italic">
                                Not solved yet
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium text-sm">
                              {formatDate(
                                ticket.created_at ||
                                ticket.created_date ||
                                ticket.date_created
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowDetails(true);
                                }}
                                className="px-3.5 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1.5 text-sm font-medium border border-blue-200 transition-all"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </button>

                              {/* Always show resolve/resolved button for admins */}
                              {isAdminUser() && (
                                <button
                                  onClick={() =>
                                    !isResolved && openResolveModal(ticket)
                                  }
                                  disabled={isResolved || isResolving}
                                  className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium border transition-all ${isResolved
                                    ? "bg-green-50 text-green-700 border-green-300 cursor-default"
                                    : isResolving
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                                    }`}
                                >
                                  {isResolving ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Resolving...
                                    </>
                                  ) : isResolved ? (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      Resolved
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4" />
                                      Resolve
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - FIXED */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, filteredTotal)} of{" "}
                    {filteredTotal} tickets • Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`px-3.5 py-2 min-w-[40px] rounded-lg font-medium ${pagination.page === pageNum
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                        <>
                          <span className="px-2 py-2">...</span>
                          <button
                            onClick={() => goToPage(pagination.pages)}
                            className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            {pagination.pages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3.5 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ticket Details Modal */}
        {showDetails && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-300 animate-slide-in">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow">
                        <Ticket className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Ticket Details
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      ID:{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        {formatTicketId(selectedTicket)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors transform hover:rotate-90 duration-300"
                  >
                    <XCircle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Ticket Content */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-blue-600" />
                      {selectedTicket.service ||
                        selectedTicket.title ||
                        "No Service"}
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedTicket.description ||
                          selectedTicket.issue ||
                          "No description available"}
                      </p>

                      {/* Attachment Section - ENHANCED */}
                      {selectedTicket.attachment && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Attachment:
                            </span>
                          </div>

                          {isImageFile(selectedTicket.attachment) ? (
                            // For Images: Show thumbnail with View button
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                  <ImageIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {getFileNameFromUrl(selectedTicket.attachment) || "Image"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Click view to see the image
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => openImageViewer(selectedTicket.attachment)}
                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-sm font-medium flex items-center gap-1.5"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                        View Image
                                      </button>

                                    </div>
                                  </div>
                                </div>
                              </div>

                            </div>
                          ) : (
                            // For Non-Image Files: Show download only
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                                <File className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {getFileNameFromUrl(selectedTicket.attachment) || "Attachment"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Click download to save the file
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => downloadAttachment(selectedTicket.attachment)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-sm font-medium flex items-center gap-1.5"
                                  >
                                    <DownloadCloud className="h-3.5 w-3.5" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 p-4 rounded-xl border border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">Status</p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${statusStyles[selectedTicket.status]?.color ||
                            "bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 border border-gray-200"
                            }`}
                        >
                          {(() => {
                            const Icon =
                              statusStyles[selectedTicket.status]?.icon ||
                              AlertCircle;
                            return <Icon className="h-3.5 w-3.5" />;
                          })()}
                          {statusStyles[selectedTicket.status]?.label ||
                            selectedTicket.status ||
                            "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100/30 p-4 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-600 mb-2">User Type</p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${userTypeStyles[
                            extractUserType(selectedTicket.created_by)
                          ]?.color ||
                            "bg-gradient-to-r from-gray-500/10 to-gray-500/5 text-gray-700 border border-gray-200"
                            }`}
                        >
                          {(() => {
                            const IconComponent =
                              userTypeStyles[
                                extractUserType(selectedTicket.created_by)
                              ]?.icon;
                            return IconComponent ? (
                              <IconComponent className="h-3.5 w-3.5" />
                            ) : null;
                          })()}
                          {userTypeStyles[
                            extractUserType(selectedTicket.created_by)
                          ]?.label ||
                            extractUserType(selectedTicket.created_by)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100/30 p-4 rounded-xl border border-green-200">
                      <p className="text-sm text-gray-600 mb-2">Created</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {formatDate(selectedTicket.created_at)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100/30 p-4 rounded-xl border border-orange-200">
                      <p className="text-sm text-gray-600 mb-2">Last Updated</p>
                      <p className="font-bold text-gray-900 mt-1">
                        {formatDate(
                          selectedTicket.updated_at ||
                          selectedTicket.modified_date ||
                          selectedTicket.solved_at
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Resolution Details Section - UPDATED */}
                  {(selectedTicket.solved_by ||
                    selectedTicket.status === "CLOSED" ||
                    selectedTicket.status === "closed" ||
                    selectedTicket.admin_notes) && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-100/30 p-5 rounded-2xl border border-green-200">
                        <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5" />
                          Resolution Details
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {selectedTicket.solved_by && (
                              <div>
                                <p className="text-sm text-green-700">Solved By</p>
                                <p className="font-bold text-green-900 mt-1 flex items-center gap-1">
                                  {extractSolvedByUsername(selectedTicket.solved_by)}
                                  {selectedTicket.solved_by
                                    .toLowerCase()
                                    .includes("admin") && (
                                      <Crown className="h-4 w-4 text-yellow-500" />
                                    )}
                                </p>
                              </div>
                            )}
                            {selectedTicket.solved_at && (
                              <div>
                                <p className="text-sm text-green-700">Solved At</p>
                                <p className="font-bold text-green-900 mt-1">
                                  {formatDate(selectedTicket.solved_at)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Resolution Message - ENHANCED */}
                          {(selectedTicket.admin_notes || resolveData) && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-green-700">
                                  Admin Resolution Message:
                                </p>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                  Visible to User
                                </span>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                                <p className="text-gray-700 leading-relaxed text-sm">
                                  {selectedTicket.admin_notes || resolveData}
                                </p>
                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-end">
                                  <span className="text-xs text-gray-500">
                                    This message will be visible to the user in their helpdesk
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* User Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      Created By Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-bold text-gray-900">
                            {extractUsername(selectedTicket.created_by)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                          <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">User Type</p>
                          <p className="font-bold text-gray-900">
                            {extractUserType(selectedTicket.created_by)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {isAdminUser()
                        ? "Admin actions available"
                        : "Contact admin to change status"}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDetails(false)}
                        className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 border border-gray-300 font-semibold shadow-sm transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Viewer Modal */}
        {imageViewer.isOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-[60] image-viewer-overlay">
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={closeImageViewer}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
              >
                <X className="h-6 w-6 text-white" />
              </button>

              <div className="image-viewer-content relative">
                <div className="mb-4 text-center">
                  <p className="text-white text-sm truncate max-w-md mx-auto">
                    {imageViewer.fileName}
                  </p>
                </div>

                <img
                  src={imageViewer.imageUrl}
                  alt="Attachment"
                  className="image-viewer-img rounded-lg shadow-2xl mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='16' fill='%23999'%3EImage failed to load%3C/text%3E%3C/svg%3E";
                  }}
                />

                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={() => downloadAttachment(imageViewer.imageUrl, imageViewer.fileName)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <DownloadCloud className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={closeImageViewer}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resolve Ticket Modal - ENHANCED */}
        {showResolveModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-300 animate-slide-in">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg shadow">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Resolve Ticket
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      ID:{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        {formatTicketId(selectedTicket)}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={closeResolveModal}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XCircle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Ticket Details:
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-medium text-gray-900">
                          {selectedTicket.service || selectedTicket.title}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedTicket.description?.substring(0, 100)}...
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Details (Important)
                    </label>
                    <textarea
                      value={resolveData}
                      onChange={(e) => setResolveData(e.target.value)}
                      placeholder="Enter resolution details that will be visible to retailer/master/dealer. This message will be shown to the user when they view their ticket."
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm"
                      rows="5"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Note:</strong> This message will be visible to the user when they view their closed ticket in their helpdesk. Please provide clear resolution details.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 font-semibold">
                          Important: User-Facing Message
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          The resolution message you enter above will be displayed to the user. Make sure it's helpful and explains how the issue was resolved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={closeResolveModal}
                    className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 border border-gray-300 font-semibold shadow-sm transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      updateTicketStatus(getTicketId(selectedTicket), "SOLVED", resolveData)
                    }
                    disabled={!resolveData.trim()}
                    className={`px-5 py-2.5 rounded-xl font-semibold shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 ${!resolveData.trim()
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white"
                      }`}
                  >
                    <Check className="h-4 w-4" />
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}