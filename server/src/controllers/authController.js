const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require("../utils/tokens");

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select(
      "+password +refreshTokens",
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "اسم المستخدم أو الباسورد غلط",
      });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    //  store refresh token in db to can cancle
    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        accessToken,
        user: { id: user._id, username: user.username, role: user.role },
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
