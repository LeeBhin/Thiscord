import { createSlice } from '@reduxjs/toolkit';

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    signalReceived: false,
    loginReceived: false,
    writingReceived: false,
    writingToMeReceived: false,
    signalMeReceived: false,
    chatSignalReceived: false,
    chatRemoveReceived: false,
    chatEditReceived: false,
    requestReceived: false,
    chatMessage: {},
    toMeMessage: {},
    chatRemove: {},
    chatEdit: {},
    requestPage: "",
    currentPage: "",
    whoWriting: {},
    whoWritingToMe: {},
    userInfo: {
      name: '',
      iconColor: '',
      userId: ''
    },
    receiverInfo: {
      name: '',
      iconColor: '',
    },
  },
  reducers: {
    triggerSignal: (state, action) => {
      state.signalReceived = !state.signalReceived;
      state.currentPage = action.payload;
    },
    loginSignal: (state) => {
      state.loginReceived = !state.loginReceived;
    },
    writingSignal: (state, action) => {
      state.writingReceived = !state.writingReceived;
      state.whoWriting = action.payload;
    },
    writingToMe: (state, action) => {
      state.writingToMeReceived = !state.writingToMeReceived;
      state.whoWritingToMe = action.payload;
    },
    signalToMe: (state, action) => {
      state.signalMeReceived = !state.signalMeReceived;
      state.toMeMessage = action.payload;
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
    requestSignal: (state, action) => {
      state.requestReceived = !state.requestReceived;
      state.requestPage = action.payload;
    },
    setUserInfo: (state, action) => {
      const { name = '', iconColor = '', userId = '' } = action.payload || {};
      state.userInfo = { name, iconColor, userId };
    },
    setReceiverInfo: (state, action) => {
      const { name = '', iconColor = '' } = action.payload || {};
      state.receiverInfo = { name, iconColor };
    },
  },
});

export const { triggerSignal, signalToMe, chatSignal, setUserInfo, setReceiverInfo, chatRemoveSignal, chatEditSignal, loginSignal, requestSignal, writingSignal, writingToMe } = counterSlice.actions;
export default counterSlice.reducer;
