import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import extinguisherReducer from "./extinguisherSlice";
import inspectionReducer from "./inspectionSlice";
import maintenanceReducer from "./maintenanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    extinguishers: extinguisherReducer,
    inspections: inspectionReducer,
    maintenance: maintenanceReducer,
  },
});
