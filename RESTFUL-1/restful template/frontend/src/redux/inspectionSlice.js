import { createSlice } from "@reduxjs/toolkit";

export default createSlice({
  name: "inspections",
  initialState: { selected: null },
  reducers: {
    setSelectedInspection: (state, action) => {
      state.selected = action.payload;
    },
  },
}).reducer;
