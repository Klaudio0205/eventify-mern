import Booking from "../models/Booking.js";
import Category from "../models/Category.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

function defaultTicketTypes(event) {
  const vipCapacity = Math.max(Math.floor(event.totalTickets * 0.15), 1);
  const studentCapacity = Math.max(Math.floor(event.totalTickets * 0.2), 1);
  const regularCapacity = Math.max(event.totalTickets - vipCapacity - studentCapacity, 1);
  return [
    { name: "Regular", price: event.price, capacity: regularCapacity, soldTickets: Math.min(event.soldTickets || 0, regularCapacity) },
    { name: "VIP", price: Math.round(event.price * 1.8), capacity: vipCapacity, soldTickets: 0 },
    { name: "Student", price: Math.round(event.price * 0.7), capacity: studentCapacity, soldTickets: 0 }
  ];
}

function generateTicketCode(eventId) {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `EVT-${eventId.toString().slice(-5).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function isValidSeat(seat) {
  return /^[A-C][1-5]$/.test(seat);
}

export async function getBookings(req, res, next) {
  try {
    let filter = { user: req.user._id };
    if (req.user.role === "admin" || req.user.role === "staff") filter = {};
    if (req.user.role === "organizer") {
      const events = await Event.find({ organizer: req.user._id }).select("_id");
      filter = { event: { $in: events.map((event) => event._id) } };
    }
    const bookings = await Booking.find(filter)
      .populate("user", "name email")
      .populate({ path: "event", populate: { path: "venue" } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    const { event: eventId, quantity = 1, selectedSeats = [], ticketType = "Regular", attendees = [] } = req.body;
    const event = await Event.findById(eventId);
    if (!event || event.status !== "published") {
      res.status(404);
      throw new Error("Eventi nuk eshte i disponueshem.");
    }

    const isSeated = event.seatingType === "seated";
    const finalQuantity = isSeated ? selectedSeats.length : Number(quantity);

    if (!finalQuantity || finalQuantity < 1) {
      res.status(400);
      throw new Error(isSeated ? "Zgjidh te pakten nje vend." : "Zgjidh numrin e biletave.");
    }

    if (finalQuantity > event.bookingLimit) {
      res.status(400);
      throw new Error(`Mund te rezervosh maksimumi ${event.bookingLimit} bileta per kete event.`);
    }

    if (!event.ticketTypes.length) event.ticketTypes = defaultTicketTypes(event);
    const selectedType = event.ticketTypes.find((type) => type.name === ticketType) || event.ticketTypes[0];
    if (!selectedType) {
      res.status(400);
      throw new Error("Ky event nuk ka tipe biletash.");
    }

    const available = selectedType.capacity - selectedType.soldTickets;
    if (finalQuantity > available) {
      res.status(400);
      throw new Error("Nuk ka mjaftueshem bileta.");
    }

    if (isSeated) {
      const uniqueSeats = new Set(selectedSeats);
      if (uniqueSeats.size !== selectedSeats.length) {
        res.status(400);
        throw new Error("Ke zgjedhur vende te dublikuara.");
      }
      if (!selectedSeats.every(isValidSeat)) {
        res.status(400);
        throw new Error("Seat map lejon vetem vende nga A1 deri C5.");
      }

      const existing = await Booking.find({
        event: event._id,
        status: { $ne: "cancelled" },
        selectedSeats: { $in: selectedSeats }
      }).select("selectedSeats");
      const occupied = existing.flatMap((booking) => booking.selectedSeats).filter((seat) => selectedSeats.includes(seat));
      if (occupied.length) {
        res.status(400);
        throw new Error(`Keto vende jane te zena: ${[...new Set(occupied)].join(", ")}`);
      }
    }

    const normalizedAttendees = Array.from({ length: finalQuantity }, (_, index) => {
      const attendee = attendees[index];
      const fullName = typeof attendee === "string" ? attendee : attendee?.fullName;
      return {
        fullName: String(fullName || "").trim(),
        seat: isSeated ? selectedSeats[index] || "" : ""
      };
    });

    if (normalizedAttendees.some((attendee) => attendee.fullName.length < 3)) {
      res.status(400);
      throw new Error("Vendos emer dhe mbiemer per cdo bilete.");
    }

    const subtotal = finalQuantity * selectedType.price;
    const serviceFee = Math.round(subtotal * 0.06);
    const totalPrice = subtotal + serviceFee;
    const ticketCode = generateTicketCode(event._id);

    const booking = await Booking.create({
      user: req.user._id,
      event: event._id,
      ticketType: selectedType.name,
      selectedSeats: isSeated ? selectedSeats : [],
      attendees: normalizedAttendees,
      quantity: finalQuantity,
      unitPrice: selectedType.price,
      serviceFee,
      totalPrice,
      total: totalPrice,
      status: "reserved",
      ticketCode
    });

    selectedType.soldTickets += finalQuantity;
    event.soldTickets += finalQuantity;
    event.remainingSeats = Math.max((event.totalTickets || 0) - event.soldTickets, 0);
    if (event.soldTickets >= event.totalTickets) event.status = "soldout";
    await event.save();

    res.status(201).json(
      await Booking.findById(booking._id)
        .populate("user", "name email")
        .populate({ path: "event", populate: { path: "venue" } })
    );
  } catch (error) {
    next(error);
  }
}

export async function updateBooking(req, res, next) {
  try {
    const existingBooking = await Booking.findById(req.params.id).populate("event");
    if (!existingBooking) {
      res.status(404);
      throw new Error("Booking nuk u gjet.");
    }

    const ownsEvent = String(existingBooking.event?.organizer) === String(req.user._id);
    const ownsBooking = String(existingBooking.user) === String(req.user._id);
    const userCancelsOwnBooking = ownsBooking && req.body.status === "cancelled" && Object.keys(req.body).every((key) => key === "status");
    if (req.user.role !== "admin" && !ownsEvent && !userCancelsOwnBooking) {
      res.status(403);
      throw new Error("Nuk ke akses per te ndryshuar kete booking.");
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("user", "name email")
      .populate({ path: "event", populate: { path: "venue" } });
    if (!booking) {
      res.status(404);
      throw new Error("Booking nuk u gjet.");
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
}

export async function deleteBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id).populate("event");
    if (!booking) {
      res.status(404);
      throw new Error("Booking nuk u gjet.");
    }

    const ownsEvent = String(booking.event?.organizer) === String(req.user._id);
    if (req.user.role !== "admin" && !ownsEvent) {
      res.status(403);
      throw new Error("Nuk ke akses per te fshire kete booking.");
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking u fshi." });
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const isOrganizer = req.user.role === "organizer";
    const eventFilter = isOrganizer ? { organizer: req.user._id } : {};
    const myEvents = await Event.find(eventFilter).populate("venue").populate("organizer", "name email").sort({ createdAt: -1 });
    const eventIds = myEvents.map((event) => event._id);
    const bookingFilter = isOrganizer ? { event: { $in: eventIds } } : {};

    const [summary] = await Booking.aggregate([
      { $match: bookingFilter },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
          bookings: { $sum: 1 },
          tickets: { $sum: "$quantity" },
          checkedIn: { $sum: { $cond: [{ $eq: ["$status", "checked-in"] }, 1, 0] } }
        }
      }
    ]);
    const bookings = await Booking.find(bookingFilter)
      .populate("user", "name email role")
      .populate({ path: "event", populate: { path: "venue" } })
      .sort({ createdAt: -1 });
    const attendees = bookings.map((booking) => ({
      _id: booking._id,
      name: booking.user?.name,
      email: booking.user?.email,
      event: booking.event?.title,
      ticketType: booking.ticketType,
      selectedSeats: booking.selectedSeats || [],
      quantity: booking.quantity,
      attendees: booking.attendees || [],
      status: booking.status,
      ticketCode: booking.ticketCode
    }));
    const base = summary || { revenue: 0, bookings: 0, tickets: 0, checkedIn: 0 };

    if (req.user.role === "admin") {
      const [users, events, categories, soldOutEvents, popularCategories, topOrganizers] = await Promise.all([
        User.countDocuments(),
        Event.countDocuments(),
        Category.countDocuments(),
        Event.countDocuments({
          $or: [
            { status: "soldout" },
            { remainingSeats: { $lte: 0 } }
          ]
        }),
        Event.aggregate([
          {
            $group: {
              _id: "$category",
              events: { $sum: 1 },
              soldTickets: { $sum: "$soldTickets" },
              capacity: { $sum: "$totalTickets" },
              averageRating: { $avg: "$averageRating" }
            }
          },
          { $sort: { soldTickets: -1, events: -1 } },
          { $limit: 6 },
          {
            $project: {
              _id: 0,
              name: "$_id",
              events: 1,
              soldTickets: 1,
              capacity: 1,
              averageRating: { $round: ["$averageRating", 1] }
            }
          }
        ]),
        Booking.aggregate([
          {
            $lookup: {
              from: "events",
              localField: "event",
              foreignField: "_id",
              as: "event"
            }
          },
          { $unwind: "$event" },
          {
            $group: {
              _id: "$event.organizer",
              revenue: { $sum: "$total" },
              tickets: { $sum: "$quantity" },
              bookings: { $sum: 1 },
              events: { $addToSet: "$event._id" }
            }
          },
          { $sort: { revenue: -1, tickets: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "organizer"
            }
          },
          { $unwind: { path: "$organizer", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              organizerId: "$_id",
              name: { $ifNull: ["$organizer.name", "Organizer i fshire"] },
              email: { $ifNull: ["$organizer.email", "-"] },
              revenue: 1,
              tickets: 1,
              bookings: 1,
              events: { $size: "$events" }
            }
          }
        ])
      ]);
      const recentBookings = bookings.slice(0, 8).map((booking) => ({
        _id: booking._id,
        customer: booking.user?.name || "User i fshire",
        email: booking.user?.email || "-",
        event: booking.event?.title || "Event i fshire",
        ticketType: booking.ticketType,
        quantity: booking.quantity,
        status: booking.status,
        total: booking.totalPrice || booking.total,
        attendees: booking.attendees || [],
        createdAt: booking.createdAt
      }));

      return res.json({
        ...base,
        totalBookings: base.bookings,
        users,
        events,
        categories,
        soldOutEvents,
        popularCategories,
        topOrganizers,
        recentBookings,
        myEvents,
        bookings,
        attendees
      });
    }

    res.json({ ...base, totalBookings: base.bookings, events: myEvents.length, myEvents, bookings, attendees });
  } catch (error) {
    next(error);
  }
}
