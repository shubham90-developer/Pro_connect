import mongoose from "mongoose";
import User from "./user.schema.js";

const connectionRequest = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  connectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  status_accepted: {
    type: Boolean,
    default: null,
  },
});

const ConnectionRequest = mongoose.model(
  "connectionRequest",
  connectionRequest
);
export default ConnectionRequest;
