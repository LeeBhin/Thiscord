import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    signalReceived: false,
    userInfo: {
      name: '',
      iconColor: '',
    },
  },
  reducers: {
    triggerSignal: (state) => {
      state.signalReceived = !state.signalReceived;
    },
    setUserInfo: (state, action) => {
      const { name, iconColor } = action.payload;
      state.userInfo = { name, iconColor };
    },
  },
});

export const { triggerSignal, setUserInfo } = counterSlice.actions;
export default counterSlice.reducer;
