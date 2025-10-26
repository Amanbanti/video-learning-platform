import jwt from 'jsonwebtoken';

export const generateToken = (req, res, user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }

  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const isProd = process.env.NODE_ENV === 'production';
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const isHttps = (forwardedProto && String(forwardedProto).includes('https')) || req?.protocol === 'https';

  const cookieOptions = {
    httpOnly: true,
    secure: isProd || isHttps,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  };

  if (isProd && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.cookie('jwt', token, cookieOptions);
};
