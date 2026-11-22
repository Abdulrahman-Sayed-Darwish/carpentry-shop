const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require("../utils/tokens");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // role مش بيجي من الـ body أبدًا: دايمًا customer
    const user = await User.create({
      username,
      email,
      password,
      role: "customer",
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
//  login
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // لو فيه @ يبقى إيميل، غير كده username
    const query = identifier.includes("@")
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const user = await User.findOne(query).select("+password +refreshTokens");

    // نفس الرسالة في الحالتين عشان ما نكشفش هل الحساب موجود
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "بيانات الدخول غلط",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) {
      return res
        .status(401)
        .json({ error: "NO_TOKEN", message: "غير مسجّل دخول" });
    }

    let payload;
    try {
      payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({ error: "INVALID_TOKEN", message: "الجلسة انتهت" });
    }
    const user = await User.findById(payload.id).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(oldToken)) {
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({ error: "INVALID_TOKEN", message: "الجلسة انتهت" });
    }

    const newRefreshToken = signRefreshToken(user);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== oldToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    res.json({ data: { accessToken: signAccessToken(user) } });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await User.updateOne(
        { refreshTokens: token },
        { $pull: { refreshTokens: token } },
      );
    }

    clearRefreshCookie(res);
    res.json({ data: { message: "تم تسجيل الخروج" } });
  } catch (err) {
    next(err);
  }
};
