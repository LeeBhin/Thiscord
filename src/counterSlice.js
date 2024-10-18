import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    signalReceived: false,
    signalMeReceived: false,
    chatSignalReceived: false,
    chatRemoveReceived: false,
    chatEditReceived: false,
    chatMessage: {},
    chatRemove: {},
    chatEdit: {},
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
    signalToMe: (state) => {
      state.signalMeReceived = !state.signalMeReceived;
    },
    chatSignal: (state, action) => {
      state.chatSignalReceived = !state.chatSignalReceived;
      state.chatMessage = action.payload;
    },
    chatRemoveSignal: (state, action) => {
      state.chatRemoveReceived = !state.chatRemoveReceived;
      state.chatRemove = action.payload;
    },
    chatEditSignal: (state, action) => {
      state.chatEditReceived = !state.chatEditReceived;
      state.chatEdit = action.payload;
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

export const { triggerSignal, signalToMe, chatSignal, setUserInfo, setReceiverInfo, chatRemoveSignal, chatEditSignal } = counterSlice.actions;
export default counterSlice.reducer;
