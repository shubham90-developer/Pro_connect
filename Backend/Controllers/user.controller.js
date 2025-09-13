import User from "../Models/user.schema.js";
import Profile from "../Models/profile.model.js";
import ConnectionRequest from "../Models/connection.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";

const convertUserDataToPdf = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);

  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
  });
  doc.fontSize(14).text(`Name:${userData.userId.name}`);
  doc.fontSize(14).text(`Username:${userData.userId.username}`);
  doc.fontSize(14).text(`Email:${userData.userId.email}`);
  doc.fontSize(14).text(`Bio:${userData.bio}`);
  doc.fontSize(14).text(`Current Position:${userData.currentPost}`);

  doc.fontSize(14).text("Past work:");
  userData.pastWork.forEach((work) => {
    doc.fontSize(14).text(`Company:${work.company}`);
    doc.fontSize(14).text(`Position:${work.position}`);
    doc.fontSize(14).text(`Years:${work.years}`);
  });
  doc.end();
  return outputPath;
};

export const register = async (req, res) => {
  try {
    console.log("Register controller called");
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(500).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      email,
    });
    if (user) return res.status(400).json({ message: "User already exist" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();
    const profile = new Profile({ userId: newUser._id });
    await profile.save();
    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return res.status(404).json({ message: "user does not exist" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  await User.updateOne({ _id: user._id }, { $set: { token: token } });
  return res.json({ token });
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.profilePicture = req.file.path;
    await user.save();

    return res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Pull only the fields you allow
    const { name, username } = newUserData;

    // If username provided AND changed -> check for duplicates
    if (typeof username === "string" && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "Username already in use" });
      }
      user.username = username;
    }

    // Update name if provided
    if (typeof name === "string") {
      user.name = name;
    }

    await user.save();
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    res.json({ profile: userProfile });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(400).json({ message: "User not found" });
    }
    const profileToUpdate = await Profile.findOne({ userId: userProfile._id });
    Object.assign(profileToUpdate, newProfileData);
    await profileToUpdate.save();
    return res.json({ message: "profile updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const allProfiles = await Profile.find().populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ profiles: allProfiles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfileByUsername = async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Added proper status
    }

    const profile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile }); // ✅ RETURNING the profile
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const downloadUserResume = async (req, res) => {
  try {
    const user_id = req.query.id;
    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture"
    );
    let outputPath = await convertUserDataToPdf(userProfile);
    return res.json({ message: outputPath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const { token, connectionId } = req.body;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      return res.json({ message: "Request already sent" });
    }

    const newRequest = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await newRequest.save();

    return res.json({ message: "Connection sent" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const { token } = req.query; // correct for GET
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("userId", "name username email profilePicture");

    return res.json({ connections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const myConnections = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");
    res.json({ connections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { token, requestId, actionType } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const connection = await ConnectionRequest.findOne({ _id: requestId });
    if (!connection) {
      res.status(400).json({ message: "Connection not found" });
    }
    if (actionType == "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    await connection.save();
    return res.json({ message: "request updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
