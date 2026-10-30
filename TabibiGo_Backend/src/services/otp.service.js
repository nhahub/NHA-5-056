
const crypto = require("crypto");

const OTPCode = require("../models/OTPCode");
const User = require("../models/User");

const { sendEmail } = require("./email.service");

// Generate a random 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Hash OTP using HMAC
const hashOTP = (email, code, purpose) => {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${email}:${purpose}:${code}`)
    .digest("hex");
};

const createOTP = async (email, purpose) => {
    console.log("CREATE OTP FUNCTION STARTED!");
  const code = generateOTP();

  const codeHash = hashOTP(email, code, purpose);

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const savedOTP = await OTPCode.create({
    email,
    codeHash,
    purpose,
    expiresAt
  });

  console.log("OTP Saved Successfully!");
  console.log("Database:", savedOTP.db.name);
  console.log("MongoDB Host:", savedOTP.db.host);
  console.log("Collection:", savedOTP.collection.name);
  console.log("OTP ID:", savedOTP._id);
  const checkOTP = await OTPCode.findById(savedOTP._id);
  console.log("Mongoose Collection:", OTPCode.collection.name);
console.log("Total OTP Documents:", await OTPCode.countDocuments());

console.log("OTP visible after save:", Boolean(checkOTP));

  return code;
};
// Send email verification OTP
const sendEmailVerificationOTP = async (email) => {
  email = email.trim().toLowerCase();

  // 1. Find user
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Check email verification
  if (user.emailVerified) {
    const error = new Error("Email is already verified.");
    error.statusCode = 409;
    throw error;
  }

  // 3. Prevent frequent OTP requests (60 seconds)
  const recentOTP = await OTPCode.findOne({
    email,
    purpose: "email_verification",
    createdAt: {
      $gt: new Date(Date.now() - 60 * 1000)
    }
  });

  if (recentOTP) {
    const error = new Error(
      "Please wait 60 seconds before requesting another OTP."
    );
    error.statusCode = 429;
    throw error;
  }

  // 4. Remove previous unused OTP codes
  await OTPCode.deleteMany({
    email,
    purpose: "email_verification",
    consumedAt: null
  });

  // 5. Generate and save new OTP
  const code = await createOTP(
    email,
    "email_verification"
  );

  // 6. Send OTP by email
  try {
    await sendEmail({
      to: email,
      subject: "TabibiGo - Email Verification",
      text: `Your verification code is: ${code}. It expires in 5 minutes.`,
      html: `
        <h2>Welcome to TabibiGo!</h2>
        <p>Use the following code to verify your email:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `
    });
  } catch (error) {
    // Remove the OTP if email sending fails
    await OTPCode.deleteOne({
      email,
      purpose: "email_verification",
      codeHash: hashOTP(email, code, "email_verification")
    });

    const emailError = new Error("Failed to send verification email.");
    emailError.statusCode = 502;
    throw emailError;
  }

  return true;
};

const sendPasswordResetOTP = async (email) => {
  email = email.trim().toLowerCase();

  // 1. Find user
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Check recent OTP request
  const recentOTP = await OTPCode.findOne({
    email,
    purpose: "password_reset",
    createdAt: {
      $gt: new Date(Date.now() - 60 * 1000)
    }
  });

  if (recentOTP) {
    const error = new Error(
      "Please wait 60 seconds before requesting another OTP."
    );
    error.statusCode = 429;
    throw error;
  }

  // 3. Remove previous unused OTP codes
  await OTPCode.deleteMany({
    email,
    purpose: "password_reset",
    consumedAt: null
  });

  // 4. Generate and save OTP
  const code = await createOTP(email, "password_reset");

  // 5. Send OTP by email
  try {
    await sendEmail({
      to: email,
      subject: "TabibiGo - Password Reset",
      text: `Your password reset code is: ${code}. It expires in 5 minutes.`,
      html: `
        <h2>TabibiGo Password Reset</h2>
        <p>Use the following code to reset your password:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `
    });
  } catch (error) {
    await OTPCode.deleteOne({
      email,
      purpose: "password_reset",
      codeHash: hashOTP(email, code, "password_reset")
    });

    const emailError = new Error("Failed to send password reset email.");
    emailError.statusCode = 502;
    throw emailError;
  }

  return true;
};

// Verify email OTP
const verifyEmailOTP = async ({ email, code }) => {
  email = email.trim().toLowerCase();

  // 1. Find user
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if already verified
  if (user.emailVerified) {
    const error = new Error("Email is already verified.");
    error.statusCode = 409;
    throw error;
  }

  // 3. Find latest unused OTP
  const otpRecord = await OTPCode.findOne({
    email,
    purpose: "email_verification",
    consumedAt: null
  })
    .sort({ createdAt: -1 })
    .select("+codeHash");

  if (!otpRecord) {
    const error = new Error("Invalid or expired OTP.");
    error.statusCode = 400;
    throw error;
  }

  // 4. Check expiration
  const now = new Date();

  if (otpRecord.expiresAt <= now) {
    const error = new Error("OTP has expired.");
    error.statusCode = 400;
    throw error;
  }

  // 5. Check maximum attempts
  if (otpRecord.attempts >= 5) {
    const error = new Error("Maximum OTP attempts exceeded.");
    error.statusCode = 429;
    throw error;
  }

  // 6. Compare submitted OTP with saved hash
  const submittedHash = hashOTP(
    email,
    code,
    "email_verification"
  );

  const submittedBuffer = Buffer.from(submittedHash, "hex");
  const savedBuffer = Buffer.from(otpRecord.codeHash, "hex");

  const isMatch =
    submittedBuffer.length === savedBuffer.length &&
    crypto.timingSafeEqual(submittedBuffer, savedBuffer);

  // 7. Handle incorrect OTP
  if (!isMatch) {
    const updatedOTP = await OTPCode.findOneAndUpdate(
      {
        _id: otpRecord._id,
        consumedAt: null,
        expiresAt: { $gt: now },
        attempts: { $lt: 5 }
      },
      {
        $inc: { attempts: 1 }
      },
      { returnDocument: "after" }
    );

    if (!updatedOTP || updatedOTP.attempts >= 5) {
      const error = new Error("Maximum OTP attempts exceeded.");
      error.statusCode = 429;
      throw error;
    }

    const error = new Error("Incorrect OTP.");
    error.statusCode = 400;
    throw error;
  }

  // 8. Consume OTP (prevent reuse)
  const consumedOTP = await OTPCode.findOneAndUpdate(
    {
      _id: otpRecord._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: 5 }
    },
    {
      $set: { consumedAt: now }
    },
    { returnDocument: "after" }
  );
  

  if (!consumedOTP) {
    const error = new Error("OTP is no longer valid.");
    error.statusCode = 400;
    throw error;
  }

  // 9. Verify user email
  user.emailVerified = true;
  await user.save();
  

  return true;
};


const verifyPasswordResetOTP = async ({ email, code }) => {
  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid or expired OTP.");
    error.statusCode = 400;
    throw error;
  }

  const otpRecord = await OTPCode.findOne({
    email,
    purpose: "password_reset",
    consumedAt: null
  })
    .sort({ createdAt: -1 })
    .select("+codeHash");

  if (!otpRecord || otpRecord.expiresAt <= new Date()) {
    const error = new Error("Invalid or expired OTP.");
    error.statusCode = 400;
    throw error;
  }

  if (otpRecord.attempts >= 5) {
    const error = new Error("Maximum OTP attempts exceeded.");
    error.statusCode = 429;
    throw error;
  }

  const submittedHash = hashOTP(
    email,
    code,
    "password_reset"
  );

  const submittedBuffer = Buffer.from(submittedHash, "hex");
  const savedBuffer = Buffer.from(otpRecord.codeHash, "hex");

  const isMatch =
    submittedBuffer.length === savedBuffer.length &&
    crypto.timingSafeEqual(submittedBuffer, savedBuffer);

  if (!isMatch) {
    const updatedOTP = await OTPCode.findOneAndUpdate(
      {
        _id: otpRecord._id,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 5 }
      },
      { $inc: { attempts: 1 } },
      { returnDocument: "after" }
    );

    if (!updatedOTP || updatedOTP.attempts >= 5) {
      const error = new Error("Maximum OTP attempts exceeded.");
      error.statusCode = 429;
      throw error;
    }

    const error = new Error("Incorrect OTP.");
    error.statusCode = 400;
    throw error;
  }


  // Generate a secure password reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the reset token before saving it
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const now = new Date();

  // Consume OTP and save reset token atomically
  const consumedOTP = await OTPCode.findOneAndUpdate(
    {
      _id: otpRecord._id,
      consumedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: 5 }
    },
    {
      $set: {
        consumedAt: now,
        resetTokenHash,
        resetTokenExpiresAt: new Date(now.getTime() + 5 * 60 * 1000)
      }
    },
    { returnDocument: "after" }
  );

  if (!consumedOTP) {
    const error = new Error("OTP is no longer valid.");
    error.statusCode = 400;
    throw error;
  }

  return resetToken;


};

module.exports = {
  createOTP,
  hashOTP,
  sendEmailVerificationOTP,
  verifyEmailOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTP
};
