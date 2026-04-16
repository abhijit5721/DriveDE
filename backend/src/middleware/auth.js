const { supabase } = require('../supabaseClient'); // We will create this client file next

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Authorization header should be in the format: Bearer <token>' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found for this token.' });
  }

  req.user = user;
  next();
};

module.exports = authMiddleware;

