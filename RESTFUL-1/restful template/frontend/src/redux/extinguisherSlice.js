import { createSlice } from "@reduxjs/toolkit";

export default createSlice({
  name: "extinguishers",
  initialState: { selected: null },
  reducers: {
    setSelectedExtinguisher: (state, action) => {
      state.selected = action.payload;
    },
  },
}).reducer;
