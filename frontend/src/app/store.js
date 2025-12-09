
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import postReducer from './slices/postSlice';
import themeReducer from './slices/themeSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
	reducer: {
		auth: authReducer,
		chat: chatReducer,
		post: postReducer,
		theme: themeReducer,
		user: userReducer,
	},
});

export default store;
