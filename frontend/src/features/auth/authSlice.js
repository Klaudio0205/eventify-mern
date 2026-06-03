import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("eventifyUser");

const authSlice = createSlice({
  name: "auth",
  initialState: { user: storedUser ? JSON.parse(storedUser) : null },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("eventifyUser", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("eventifyUser");
    }
  }
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
