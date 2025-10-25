export const generateToken = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // must be true in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // cross-site cookies
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};

