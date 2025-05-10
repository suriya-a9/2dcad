import { combineReducers } from "@reduxjs/toolkit";
import toolSlice from './Slice/toolSlice';

export const rootReducer = combineReducers({
    tool :toolSlice,
})