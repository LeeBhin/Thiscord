import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    signalReceived: false,
  },
  reducers: {
    triggerSignal: (state) => {
      state.signalReceived = !state.signalReceived;
    },
  },
});

export const { increment, decrement, triggerSignal } = counterSlice.actions;
export default counterSlice.reducer;