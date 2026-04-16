require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { supabase } = require('./supabaseClient');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Profile Service
app.get('/api/profiles/me', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.patch('/api/profiles/me', authMiddleware, async (req, res) => {
  const { displayName, learningPath, transmissionType, language, theme } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      learning_path: learningPath,
      transmission_type: transmissionType,
      language: language,
      theme: theme,
    })
    .eq('id', req.user.id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Progress Service
app.get('/api/progress/lessons', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.post('/api/progress/lessons', authMiddleware, async (req, res) => {
  const { lessonId, status, completedAt, confidenceRating } = req.body;

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: req.user.id,
      lesson_id: lessonId,
      status: status,
      completed_at: completedAt,
      confidence_rating: confidenceRating,
    })
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Tracker Service
app.get('/api/tracker/sessions', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('driving_sessions')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.post('/api/tracker/sessions', authMiddleware, async (req, res) => {
  const { date, durationMinutes, category, transmissionType, notes } = req.body;

  const { data, error } = await supabase
    .from('driving_sessions')
    .insert({
      user_id: req.user.id,
      date: date,
      duration_minutes: durationMinutes,
      category: category,
      transmission_type: transmissionType,
      notes: notes,
    })
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.patch('/api/tracker/sessions/:sessionId', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  const { date, durationMinutes, category, transmissionType, notes } = req.body;

  const { data, error } = await supabase
    .from('driving_sessions')
    .update({
      date: date,
      duration_minutes: durationMinutes,
      category: category,
      transmission_type: transmissionType,
      notes: notes,
    })
    .eq('id', sessionId)
    .eq('user_id', req.user.id) // Ensure user owns the session
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.delete('/api/tracker/sessions/:sessionId', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;

  const { error } = await supabase
    .from('driving_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', req.user.id); // Ensure user owns the session

  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// Quiz Service
app.get('/api/quiz/attempts', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

app.post('/api/quiz/attempts', authMiddleware, async (req, res) => {
  const { questionId, selectedOptionId, isCorrect, lessonId, attemptedAt } = req.body;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: req.user.id,
      question_id: questionId,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      lesson_id: lessonId,
      attempted_at: attemptedAt,
    })
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
