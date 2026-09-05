import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  CalendarDays,
  MapPin,
  Users,
  Car,
  UserRound,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  UserRoundCheck,
  CheckCircle2,
  Clock3,
  PlayCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getManagerTours, deleteManagerTour } from "../../api/tourManagerApi";

const PAGE_SIZE = 10;

function normalizeResponse(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;

  return (
    data?.tours ||
    data?.data ||
    data?.results ||
    data?.items ||
    []
  );
}

function getDestination(tour) {
  const destination = tour?.destination;

  if (!destination) {
    return "Destination not assigned";
  }

  if (typeof destination === "string") {
    return destination;
  }

  return (
    destination.name ||
    destination.title ||
    destination.city ||
    destination.country ||
    "Destination not assigned"
  );
}

function getTourName(tour) {
  return tour?.title || tour?.name || "Untitled tour";
}

function getTourStatus(tour) {
  const status = String(tour?.status || "draft").toLowerCase();

  if (
    status === "in-progress" ||
    status === "in_progress" ||
    status === "ongoing" ||
    status === "active"
  ) {
    return "active";
  }

  if (
    status === "completed" ||
    status === "complete" ||
    status === "finished"
  ) {
    return "completed";
  }

  if (
    status === "cancelled" ||
    status === "canceled"
  ) {
    return "cancelled";
  }

  if (
    status === "upcoming" ||
    status === "scheduled"
  ) {
    return "upcoming";
  }

  return "draft";
}

function getDateValue(tour, field) {
  const value = tour?.[field];

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBookings(tour) {
  return Number(
    tour?.bookedGuests ??
      tour?.bookedSlots ??
      tour?.totalGuests ??
      tour?.guestsBooked ??
      tour?.totalBookings ??
      0
  );
}

function getCapacity(tour) {
  return Number(tour?.capacity ?? tour?.maxGuests ?? 0);
}

function getAssignmentStatus(tour) {
  const explicit = String(tour?.assignmentStatus || "").toLowerCase();

  if (explicit) {
    if (
      explicit.includes("complete") ||
      explicit.includes("assigned") ||
      explicit === "ready"
    ) {
      return "assigned";
    }

    if (
      explicit.includes("partial")
    ) {
      return "partial";
    }

    return "pending";
  }

  const guide = tour?.assignedGuide || tour?.guide;
  const driver = tour?.assignedDriver || tour?.driver;
  const vehicle = tour?.assignedVehicle || tour?.vehicle;

  const count = [guide, driver, vehicle].filter(Boolean).length;

  if (count === 3) return "assigned";
  if (count > 0) return "partial";

  return "pending";
}

function getPersonName(person) {
  if (!person) return "Unassigned";

  if (typeof person === "string") return person;

  return (
    person.name ||
    person.fullName ||
    `${person.firstName || ""} ${person.lastName || ""}`.trim() ||
    person.email ||
    "Unassigned"
  );
}

function getVehicleName(vehicle) {
  if (!vehicle) return "Unassigned";

  if (typeof vehicle === "string") return vehicle;

  return (
    vehicle.name ||
    vehicle.registrationNumber ||
    vehicle.registration ||
    vehicle.model ||
    vehicle.type ||
    "Unassigned"
  );
}

function StatusBadge({ status }) {
  const config = {
    upcoming: {
      label: "Upcoming",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock3,
    },
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: PlayCircle,
    },
    completed: {
      label: "Completed",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: X,
    },
    draft: {
      label: "Draft",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
    },
  };

  const item = config[status] || config.draft;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${item.className}`}
    >
      <Icon size={13} />
      {item.label}
    </span>
  );
}

function AssignmentBadge({ tour }) {
  const status = getAssignmentStatus(tour);

  const config = {
    assigned: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-red-50 text-red-700 border-red-200",
  };

  const labels = {
    assigned: "Fully assigned",
    partial: "Partially assigned",
    pending: "Needs assignment",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
        config[status]
      }`}
    >
      {labels[status]}
    </span>
  );
}

function KpiCard({ label, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 p-3 text-white">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function TourCard({ tour, onView, onEdit, onDelete }) {
  const status = getTourStatus(tour);
  const bookings = getBookings(tour);
  const capacity = getCapacity(tour);
  const percentage =
    capacity > 0
      ? Math.min(100, Math.round((bookings / capacity) * 100))
      : 0;

  const startDate =
    getDateValue(tour, "startDate") ||
    getDateValue(tour, "date");

  const endDate = getDateValue(tour, "endDate");

  const guide = tour?.assignedGuide || tour?.guide;
  const driver = tour?.assignedDriver || tour?.driver;
  const vehicle = tour?.assignedVehicle || tour?.vehicle;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <AssignmentBadge tour={tour} />
            </div>

            <h3 className="truncate text-lg font-bold text-slate-900">
              {getTourName(tour)}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin size={15} />
              <span className="truncate">{getDestination(tour)}</span>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => onView(tour)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="View tour"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100">
        <div className="bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Start
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <CalendarDays size={15} />
            {formatDate(startDate)}
          </div>
        </div>

        <div className="bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            End
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <CalendarDays size={15} />
            {formatDate(endDate)}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <Users size={16} />
            Capacity
          </span>

          <span className="text-sm font-bold text-slate-800">
            {bookings} / {capacity || "—"}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${
              percentage >= 90
                ? "bg-red-500"
                : percentage >= 70
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <UserRound size={16} className="shrink-0 text-slate-400" />
            <span className="truncate">
              Guide: <strong>{getPersonName(guide)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <UserRoundCheck size={16} className="shrink-0 text-slate-400" />
            <span className="truncate">
              Driver: <strong>{getPersonName(driver)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Car size={16} className="shrink-0 text-slate-400" />
            <span className="truncate">
              Vehicle: <strong>{getVehicleName(vehicle)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
        <div>
          <p className="text-xs text-slate-400">Price</p>
          <p className="font-bold text-slate-900">
            {formatCurrency(
              tour?.discountPrice ??
                tour?.finalPrice ??
                tour?.price ??
                0
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(tour)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900"
            title="View"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            onClick={() => onEdit(tour)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-blue-600"
            title="Edit"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(tour)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ search, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <MapPin size={26} className="text-slate-500" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {search ? "No tours found" : "No tours available"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {search
          ? "Try changing your search or filters."
          : "Create your first tour to start managing daily tour operations."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function TourManagerTours() {
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const loadTours = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getManagerTours();
      const items = normalizeResponse(response);

      setTours(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load manager tours:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load tours."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  const stats = useMemo(() => {
    const values = {
      total: tours.length,
      upcoming: 0,
      active: 0,
      completed: 0,
      needingAssignment: 0,
    };

    tours.forEach((tour) => {
      const status = getTourStatus(tour);

      if (status === "upcoming") values.upcoming += 1;
      if (status === "active") values.active += 1;
      if (status === "completed") values.completed += 1;

      if (getAssignmentStatus(tour) !== "assigned") {
        values.needingAssignment += 1;
      }
    });

    return values;
  }, [tours]);

  const destinations = useMemo(() => {
    return [...new Set(tours.map(getDestination))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [tours]);

  const filteredTours = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tours.filter((tour) => {
      const status = getTourStatus(tour);
      const assignment = getAssignmentStatus(tour);

      const matchesSearch =
        !query ||
        getTourName(tour).toLowerCase().includes(query) ||
        getDestination(tour).toLowerCase().includes(query) ||
        getPersonName(tour?.assignedGuide || tour?.guide)
          .toLowerCase()
          .includes(query) ||
        getPersonName(tour?.assignedDriver || tour?.driver)
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const matchesAssignment =
        assignmentFilter === "all" ||
        assignment === assignmentFilter;

      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [tours, search, statusFilter, assignmentFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTours.length / PAGE_SIZE)
  );

  const visibleTours = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredTours.slice(start, start + PAGE_SIZE);
  }, [filteredTours, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setAssignmentFilter("all");
    setPage(1);
  }

  function handleView(tour) {
    const id = tour?._id || tour?.id;
    const slug = tour?.slug || tour?.slugName;

    if (!id && !slug) return;

    // Public tour details are routed by slug. Fall back to the id only when
    // no slug is available so existing tour records remain viewable.
    navigate(`/tours/${slug || id}`);
  }

  function handleEdit(tour) {
    const id = tour?._id || tour?.id;

    if (!id) return;

    // Keep the edit action aligned with the registered Tour Manager route:
    // /tour-manager/edit-tour/:id
    navigate(`/tour-manager/edit-tour/${id}`);
  }

  async function handleDelete(tour) {
    const id = tour?._id || tour?.id;

    if (!id) return;

    const confirmed = window.confirm(
      `Delete "${getTourName(tour)}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteManagerTour(id);

      setTours((current) =>
        current.filter(
          (item) => String(item?._id || item?.id) !== String(id)
        )
      );
    } catch (err) {
      console.error("Failed to delete tour:", err);

      window.alert(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete this tour."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Tour Operations</span>
                <span>/</span>
                <span className="text-slate-900">Tours</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Tours Management
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Plan, monitor and coordinate every tour from one operational
                workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadTours(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => navigate("/tour-manager/create-tour")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Create Tour
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Total tours"
            value={stats.total}
            icon={MapPin}
            description="All tours in your operation"
          />

          <KpiCard
            label="Upcoming"
            value={stats.upcoming}
            icon={CalendarDays}
            description="Scheduled tours"
          />

          <KpiCard
            label="Active"
            value={stats.active}
            icon={PlayCircle}
            description="Currently operating"
          />

          <KpiCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            description="Finished tours"
          />

          <KpiCard
            label="Needs assignment"
            value={stats.needingAssignment}
            icon={AlertCircle}
            description="Guide, driver or vehicle"
          />
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search tours, destinations, guides or drivers..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={assignmentFilter}
              onChange={(event) => {
                setAssignmentFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="all">All assignments</option>
              <option value="assigned">Fully assigned</option>
              <option value="partial">Partially assigned</option>
              <option value="pending">Needs assignment</option>
            </select>

            {(search ||
              statusFilter !== "all" ||
              assignmentFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Showing{" "}
              <strong className="text-slate-600">
                {filteredTours.length}
              </strong>{" "}
              matching tours
            </span>

            {destinations.length > 0 && (
              <span>
                {destinations.length} destinations represented
              </span>
            )}
          </div>
        </section>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <AlertCircle className="mt-0.5 shrink-0" size={19} />

            <div className="flex-1">
              <p className="font-semibold">Unable to load tours</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadTours(true)}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : visibleTours.length === 0 ? (
          <EmptyState
            search={
              Boolean(search) ||
              statusFilter !== "all" ||
              assignmentFilter !== "all"
            }
            onClear={clearFilters}
          />
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleTours.map((tour) => (
                <div
                  key={tour?._id || tour?.id}
                  className={
                    deletingId === (tour?._id || tour?.id)
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                >
                  <TourCard
                    tour={tour}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row">
              <p className="text-sm text-slate-500">
                Page <strong>{page}</strong> of{" "}
                <strong>{totalPages}</strong>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
