import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItems, createItem } from "../services/mainApi";

export const fetchItems = createAsyncThunk(
  "main/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      return await getItems();
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addItem = createAsyncThunk(
  "main/addItem",
  async (data, { rejectWithValue }) => {
    try {
      return await createItem(data);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const mainSlice = createSlice({
  name: "main",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload.item);
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default mainSlice.reducer;
