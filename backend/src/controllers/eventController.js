import Event from "../models/Event.js";
import Favorite from "../models/Favorite.js";
import Booking from "../models/Booking.js";
import Venue from "../models/Venue.js";

function defaultTicketTypes(event) {
  const totalTickets = event.totalTickets || 1;
  const vipCapacity = Math.max(Math.floor(totalTickets * 0.15), 1);
  const studentCapacity = Math.max(Math.floor(totalTickets * 0.2), 1);
  const regularCapacity = Math.max(totalTickets - vipCapacity - studentCapacity, 1);
  return [
    { name: "Regular", price: event.price, capacity: regularCapacity, soldTickets: Math.min(event.soldTickets || 0, regularCapacity) },
    { name: "VIP", price: Math.round(event.price * 1.8), capacity: vipCapacity, soldTickets: 0 },
    { name: "Student", price: Math.round(event.price * 0.7), capacity: studentCapacity, soldTickets: 0 }
  ];
}

function enrichEvent(event, favoriteIds = new Set(), occupiedSeats = []) {
  const data = event.toObject ? event.toObject() : event;
  const ticketTypes = data.ticketTypes?.length
    ? data.ticketTypes
    : defaultTicketTypes(data);
  const remainingSeats = ticketTypes.reduce((sum, type) => sum + Math.max((type.capacity || 0) - (type.soldTickets || 0), 0), 0);
  return {
    ...data,
    ticketTypes,
    remainingSeats,
    occupiedSeats,
    isFavorite: favoriteIds.has(String(data._id))
  };
}

async function occupiedSeatsByEvent(eventIds) {
  const bookings = await Booking.find({
    event: { $in: eventIds },
    status: { $ne: "cancelled" },
    selectedSeats: { $exists: true, $ne: [] }
  }).select("event selectedSeats");

  return bookings.reduce((map, booking) => {
    const key = String(booking.event);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(...booking.selectedSeats);
    return map;
  }, new Map());
}

export async function getEvents(req, res, next) {
  try {
    const {
      category,
      city,
      dateFrom,
      dateTo,
      maxPrice,
      minPrice,
      page = 1,
      limit = 9,
      search,
      sort = "date",
      status
    } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      const venues = await Venue.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { venue: { $in: venues.map((venue) => venue._id) } }
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      popularity: { soldTickets: -1, averageRating: -1 },
      date: { date: 1 }
    };
    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 24);
    const [events, total] = await Promise.all([
      Event.find(filter)
        .select("title category description image bannerImage date time venue city address organizer price priceFrom capacity remainingSeats totalTickets soldTickets ticketTypes bookingLimit rating averageRating reviewCount seatingType status featured createdAt")
        .populate("venue")
        .populate("organizer", "name")
        .sort(sortMap[sort] || sortMap.date)
        .skip((currentPage - 1) * perPage)
        .limit(perPage),
      Event.countDocuments(filter)
    ]);
    const favorites = req.user ? await Favorite.find({ user: req.user._id }).select("event") : [];
    const favoriteIds = new Set(favorites.map((favorite) => String(favorite.event)));

    const occupiedMap = await occupiedSeatsByEvent(events.map((event) => event._id));

    res.json({
      items: events.map((event) => enrichEvent(event, favoriteIds, occupiedMap.get(String(event._id)) || [])),
      page: currentPage,
      pages: Math.ceil(total / perPage) || 1,
      total
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate("venue").populate("organizer", "name");
    if (!event) {
      res.status(404);
      throw new Error("Eventi nuk u gjet.");
    }
    const favorite = req.user ? await Favorite.findOne({ user: req.user._id, event: event._id }) : null;
    const occupiedMap = await occupiedSeatsByEvent([event._id]);
    res.json(enrichEvent(event, new Set(favorite ? [String(event._id)] : []), occupiedMap.get(String(event._id)) || []));
  } catch (error) {
    next(error);
  }
}

export async function getEventAttendees(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate("venue").populate("organizer", "name email role");
    if (!event) {
      res.status(404);
      throw new Error("Eventi nuk u gjet.");
    }

    const ownsEvent = String(event.organizer?._id || event.organizer) === String(req.user._id);
    if (req.user.role !== "admin" && !ownsEvent) {
      res.status(403);
      throw new Error("Nuk ke akses te attendees per kete event.");
    }

    const bookings = await Booking.find({ event: event._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        organizer: event.organizer
      },
      attendees: bookings.map((booking) => ({
        _id: booking._id,
        bookingId: booking._id,
        name: booking.user?.name || "User i fshire",
        email: booking.user?.email || "-",
        event: event.title,
        ticketType: booking.ticketType,
        selectedSeats: booking.selectedSeats || [],
        attendees: booking.attendees || [],
        quantity: booking.quantity,
        status: booking.status,
        ticketCode: booking.ticketCode,
        total: booking.totalPrice || booking.total,
        createdAt: booking.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(await Event.findById(event._id).populate("venue").populate("organizer", "name"));
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      res.status(404);
      throw new Error("Eventi nuk u gjet.");
    }

    const ownsEvent = String(existingEvent.organizer) === String(req.user._id);
    if (req.user.role !== "admin" && !ownsEvent) {
      res.status(403);
      throw new Error("Nuk ke akses per te ndryshuar kete event.");
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("venue").populate("organizer", "name");
    if (!event) {
      res.status(404);
      throw new Error("Eventi nuk u gjet.");
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      res.status(404);
      throw new Error("Eventi nuk u gjet.");
    }

    const ownsEvent = String(existingEvent.organizer) === String(req.user._id);
    if (req.user.role !== "admin" && !ownsEvent) {
      res.status(403);
      throw new Error("Nuk ke akses per te fshire kete event.");
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Eventi u fshi." });
  } catch (error) {
    next(error);
  }
}
