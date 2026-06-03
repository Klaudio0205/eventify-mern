import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../auth/authSlice.js";

const apiBaseUrl = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const { hostname } = window.location;
  const apiHost = hostname === "localhost" || hostname === "127.0.0.1" ? "localhost" : hostname;
  return `http://${apiHost}:5050/api`;
})();

const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.user?.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  }
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) api.dispatch(logout());
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Event", "Venue", "Booking", "Dashboard", "User", "Category", "Review", "Favorite"],
  endpoints: (builder) => ({
    login: builder.mutation({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
    register: builder.mutation({ query: (body) => ({ url: "/auth/register", method: "POST", body }) }),
    getEvents: builder.query({
      query: (params = "") => `/events${params}`,
      transformResponse: (response) => Array.isArray(response) ? response : response.items,
      providesTags: ["Event"]
    }),
    getEventsPage: builder.query({ query: (params = "") => `/events${params}`, providesTags: ["Event", "Favorite"] }),
    getEvent: builder.query({ query: (id) => `/events/${id}`, providesTags: ["Event"] }),
    createEvent: builder.mutation({ query: (body) => ({ url: "/events", method: "POST", body }), invalidatesTags: ["Event"] }),
    updateEvent: builder.mutation({ query: ({ id, ...body }) => ({ url: `/events/${id}`, method: "PUT", body }), invalidatesTags: ["Event"] }),
    deleteEvent: builder.mutation({ query: (id) => ({ url: `/events/${id}`, method: "DELETE" }), invalidatesTags: ["Event"] }),
    getEventAttendees: builder.query({ query: (eventId) => `/events/${eventId}/attendees`, providesTags: ["Booking", "Dashboard"] }),
    getVenues: builder.query({ query: () => "/venues", providesTags: ["Venue"] }),
    createVenue: builder.mutation({ query: (body) => ({ url: "/venues", method: "POST", body }), invalidatesTags: ["Venue"] }),
    updateVenue: builder.mutation({ query: ({ id, ...body }) => ({ url: `/venues/${id}`, method: "PUT", body }), invalidatesTags: ["Venue"] }),
    deleteVenue: builder.mutation({ query: (id) => ({ url: `/venues/${id}`, method: "DELETE" }), invalidatesTags: ["Venue"] }),
    getCategories: builder.query({ query: () => "/categories", providesTags: ["Category"] }),
    createCategory: builder.mutation({ query: (body) => ({ url: "/categories", method: "POST", body }), invalidatesTags: ["Category"] }),
    updateCategory: builder.mutation({ query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PUT", body }), invalidatesTags: ["Category"] }),
    deleteCategory: builder.mutation({ query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }), invalidatesTags: ["Category"] }),
    getUsers: builder.query({ query: () => "/users", providesTags: ["User"] }),
    createUser: builder.mutation({ query: (body) => ({ url: "/users", method: "POST", body }), invalidatesTags: ["User"] }),
    updateUser: builder.mutation({ query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PUT", body }), invalidatesTags: ["User"] }),
    deleteUser: builder.mutation({ query: (id) => ({ url: `/users/${id}`, method: "DELETE" }), invalidatesTags: ["User"] }),
    getBookings: builder.query({ query: () => "/bookings", providesTags: ["Booking"] }),
    createBooking: builder.mutation({ query: (body) => ({ url: "/bookings", method: "POST", body }), invalidatesTags: ["Booking", "Event", "Dashboard"] }),
    updateBooking: builder.mutation({ query: ({ id, ...body }) => ({ url: `/bookings/${id}`, method: "PUT", body }), invalidatesTags: ["Booking", "Dashboard"] }),
    deleteBooking: builder.mutation({ query: (id) => ({ url: `/bookings/${id}`, method: "DELETE" }), invalidatesTags: ["Booking", "Event", "Dashboard"] }),
    getReviews: builder.query({ query: (eventId) => `/reviews${eventId ? `?event=${eventId}` : ""}`, providesTags: ["Review"] }),
    createReview: builder.mutation({ query: (body) => ({ url: "/reviews", method: "POST", body }), invalidatesTags: ["Review", "Event"] }),
    updateReview: builder.mutation({ query: ({ id, ...body }) => ({ url: `/reviews/${id}`, method: "PUT", body }), invalidatesTags: ["Review", "Event"] }),
    deleteReview: builder.mutation({ query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }), invalidatesTags: ["Review", "Event"] }),
    getFavorites: builder.query({ query: () => "/favorites", providesTags: ["Favorite"] }),
    addFavorite: builder.mutation({ query: (event) => ({ url: "/favorites", method: "POST", body: { event } }), invalidatesTags: ["Favorite", "Event"] }),
    deleteFavorite: builder.mutation({ query: (eventId) => ({ url: `/favorites/${eventId}`, method: "DELETE" }), invalidatesTags: ["Favorite", "Event"] }),
    getDashboard: builder.query({ query: () => "/bookings/dashboard", providesTags: ["Dashboard"] })
  })
});

export const {
  useAddFavoriteMutation,
  useCreateBookingMutation,
  useCreateCategoryMutation,
  useCreateEventMutation,
  useCreateReviewMutation,
  useCreateUserMutation,
  useCreateVenueMutation,
  useDeleteBookingMutation,
  useDeleteCategoryMutation,
  useDeleteEventMutation,
  useDeleteFavoriteMutation,
  useDeleteReviewMutation,
  useDeleteUserMutation,
  useDeleteVenueMutation,
  useGetBookingsQuery,
  useGetCategoriesQuery,
  useGetDashboardQuery,
  useGetEventAttendeesQuery,
  useGetEventQuery,
  useGetEventsQuery,
  useGetEventsPageQuery,
  useGetFavoritesQuery,
  useGetReviewsQuery,
  useGetUsersQuery,
  useGetVenuesQuery,
  useLoginMutation,
  useRegisterMutation,
  useUpdateBookingMutation,
  useUpdateCategoryMutation,
  useUpdateEventMutation,
  useUpdateReviewMutation,
  useUpdateUserMutation,
  useUpdateVenueMutation
} = apiSlice;
