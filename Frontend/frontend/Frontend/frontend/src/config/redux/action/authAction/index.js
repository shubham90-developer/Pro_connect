import { asyncThunkCreator, createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

export const loginUser = createAsyncThunk(
  "/user/login",

  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });
      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }
      return thunkAPI.fulfillWithValue(token);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getUserAndProfile = createAsyncThunk(
  "user/get_user_and_profile",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/get_all_profiles",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_profiles");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/send_connection_request",
  async (connectionId, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/send_request", {
        token: localStorage.getItem("token"),
        connectionId: connectionId,
      });
      thunkAPI.dispatch(
        getConnectionRequests({ token: localStorage.getItem("token") })
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.fulfillWithValue(err.data);
    }
  }
);

export const getConnectionRequests = createAsyncThunk(
  "user/get_connection_requests",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/connection_requests", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.data);
    }
  }
);

export const getMyConnections = createAsyncThunk(
  "/user/my_connections",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/my_connections", {
        params: { token: localStorage.getItem("token") },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.data);
    }
  }
);

export const acceptConnection = createAsyncThunk(
  "/user/accept_connection_request",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/user/send_request_accept", {
        token: user.token,
        requestId: user.connectionId,
        actionType: user.action,
      });
      thunkAPI.dispatch(
        getConnectionRequests({ token: localStorage.getItem("token") })
      );
      thunkAPI.dispatch(
        getMyConnections({ token: localStorage.getItem("token") })
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      thunkAPI.rejectWithValue(err.data);
    }
  }
);
