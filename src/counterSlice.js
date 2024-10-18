import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    signalReceived: false,
    userInfo: {
      name: '',
      iconColor: '',
    },
    receiverInfo: {
      name: '',
      iconColor: '',
    },
  },
  reducers: {
    triggerSignal: (state) => {
      state.signalReceived = !state.signalReceived;
    },
    setUserInfo: (state, action) => {
      const { name = '', iconColor = '' } = action.payload || {};
      state.userInfo = { name, iconColor };
    },
    setReceiverInfo: (state, action) => {
      const { name = '', iconColor = '' } = action.payload || {};
      state.receiverInfo = { name, iconColor };
    },
  },
});

export const { triggerSignal, setUserInfo, setReceiverInfo } = counterSlice.actions; // 'receiverInfo' 제거
export default counterSlice.reducer;
