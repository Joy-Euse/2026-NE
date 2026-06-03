import { createSlice } from "@reduxjs/toolkit";

export default createSlice({
  name: "maintenance",
  initialState: { selected: null },
  reducers: {
    setSelectedMaintenance: (state, action) => {
      state.selected = action.payload;
    },
  },
}).reducer;
