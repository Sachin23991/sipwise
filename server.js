/**
 * server.js
 *
 * Perplexity-backed SipWise server (full functionality).
 * - Improved Perplexity endpoint probing and diagnostic logging to handle 404/502 issues.
 * - Tries multiple candidate Perplexity endpoints and returns detailed diagnostics on failure.
 * - All original app endpoints preserved (quiz, health-ai, images, daily challenges, leaderboard, points, activity).
 *
 * Usage:
 *  - Create a .env file with PERPLEXITY_API_KEY and optional STABILITY_API_KEY, FIREBASE_SERVICE_ACCOUNT, etc.
 *  - npm install express dotenv cors node-fetch form-data firebase-admin date-fns uuid
 *  - node server.js
 *
 * Note: This file intentionally avoids echoing secrets. Keep .env secret.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const admin = require('firebase-admin');
const { getDayOfYear } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// ---------------------------
// Firebase Admin init (best-effort)
let serviceAccount = null;
const possibleFiles = [
  './serviceAccountKey.json',
  './serviceAccountKey.json.json',
  './serviceAccountKey.JSON'
];
for (const f of possibleFiles) {
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const candidate = require(f);
    if (candidate) {
      serviceAccount = candidate;
      console.log(`Using Firebase service account file: ${f}`);
      break;
    }
  } catch (e) {
    // ignore
  }
}
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || 'sipwise-89d46.appspot.com';
try {
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined,
    storageBucket: FIREBASE_STORAGE_BUCKET
  });
} catch (e) {
  console.warn('Firebase initialization warning:', e && (e.message || e));
}
const db = (admin && admin.firestore) ? admin.firestore() : null;

// ---------------------------
// Environment / Keys
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || null;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || null;

console.log('Startup env check:');
console.log(' - PERPLEXITY_API_KEY:', !!PERPLEXITY_API_KEY);
console.log(' - STABILITY_API_KEY:', !!STABILITY_API_KEY);
console.log(' - FIREBASE_STORAGE_BUCKET:', FIREBASE_STORAGE_BUCKET);
console.log(' - NODE_ENV:', process.env.NODE_ENV || 'undefined');

// ---------------------------
// Perplexity helpers
// Candidate Perplexity endpoints to try (some community docs and likely variants).
const PERPLEXITY_ENDPOINT_CANDIDATES = [
  'https://api.perplexity.ai/answers',            // common community endpoint
  'https://perplexity.ai/api/answers',            // alternate
  'https://www.perplexity.ai/api/answers',        // alternate
  'https://api.perplexity.ai/ask',                // sometimes used
  'https://perplexity.ai/api/ask'                 // alternate
];

/**
 * Try Perplexity endpoints in order. Return the first successful { status, ok, text, json } response.
 * On failure returns a diagnostics array for all tried endpoints.
 */
async function callPerplexityWithProbe(prompt, options = {}) {
  if (!PERPLEXITY_API_KEY) {
    const err = new Error('PERPLEXITY_API_KEY not configured.');
    err.code = 'NO_KEY';
    throw err;
  }

  const diagnostics = [];

  for (const url of PERPLEXITY_ENDPOINT_CANDIDATES) {
    try {
      const body = {
        query: prompt,
        top_k: options.top_k || 1,
        // keep minimal; Perplexity may ignore unknown fields
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });

      const text = await resp.text();
      let json = null;
      try { json = JSON.parse(text); } catch (e) { /* not JSON */ }

      const entry = { url, status: resp.status, ok: resp.ok, text: text.slice(0, 4000) }; // truncate logged text for safety
      diagnostics.push(entry);

      if (resp.ok) {
        // Return successful response plus diagnostics for tracing
        return { success: true, url, status: resp.status, ok: true, text, json, diagnostics };
      } else {
        // Log and continue to try next endpoint
        console.warn(`Perplexity endpoint ${url} returned status ${resp.status}`);
      }
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err);
      diagnostics.push({ url, status: 'network_error', ok: false, text: msg });
      console.warn(`Perplexity endpoint ${url} network/error:`, msg);
      // try next candidate
    }
  }

  // If we reach here no endpoint returned OK
  return { success: false, diagnostics };
}

/**
 * Extract best candidate answer text from Perplexity JSON or fallback to raw text.
 * This is conservative and tries some common shapes.
 */
function extractPerplexityText(json, rawText) {
  if (!json) return rawText;
  if (typeof json.answer === 'string') return json.answer;
  if (json.answers && Array.isArray(json.answers) && json.answers[0]) {
    if (typeof json.answers[0].text === 'string') return json.answers[0].text;
    if (typeof json.answers[0].answer === 'string') return json.answers[0].answer;
  }
  if (json.results && Array.isArray(json.results) && json.results[0]) {
    if (typeof json.results[0].text === 'string') return json.results[0].text;
    if (typeof json.results[0].answer === 'string') return json.results[0].answer;
  }
  if (json.data && typeof json.data === 'string') return json.data;
  // fallback to raw
  return rawText;
}

/**
 * Helper to extract the first {...} JSON substring from a text blob.
 */
function extractFirstJson(text) {
  if (!text || typeof text !== 'string') throw new Error('No text to parse');
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object found');
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }
  throw new Error('Could not find end of JSON object');
}

// ---------------------------
// Debug endpoints
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    perplexityConfigured: !!PERPLEXITY_API_KEY,
    stabilityConfigured: !!STABILITY_API_KEY,
    firebaseConfigured: !!db,
    time: new Date().toISOString()
  });
});

// Returns per-endpoint diagnostics and the first successful response if any.
app.get('/debug/test-perplexity-key', async (req, res) => {
  if (!PERPLEXITY_API_KEY) return res.status(400).json({ error: 'PERPLEXITY_API_KEY not set' });
  try {
    const probe = await callPerplexityWithProbe('Say "Hello, I am working!"');
    if (probe.success) {
      const answer = extractPerplexityText(probe.json, probe.text);
      return res.json({ success: true, url: probe.url, status: probe.status, answer, diagnostics: probe.diagnostics });
    } else {
      return res.status(502).json({ success: false, diagnostics: probe.diagnostics });
    }
  } catch (err) {
    console.error('Perplexity debug error:', err && (err.stack || err));
    res.status(500).json({ error: String(err) });
  }
});

// ---------------------------
// QUIZ MASTER (using Perplexity for generation)
app.post('/api/quiz-master', async (req, res) => {
  const { stage, userAnswers = [], difficulty, incorrectQuestions } = req.body;
  if (!stage) return res.status(400).json({ error: 'Stage is required.' });

  try {
    let prompt;
    let expectsJson = false;

    switch (stage) {
      case 'get_fact_of_the_day':
        prompt = "You are a health and wellness expert. Provide a single, surprising, and concise 'Fact of the Day' related to hydration, beverages, or nutrition in India. Make it engaging and easy to understand. Respond with only the fact as plain text.";
        break;

      case 'start_interview':
        {
          const answerCount = (userAnswers || []).length;
          if (answerCount === 0)
            prompt = "You are a friendly health coach. Ask the very first of three personal questions about a user's typical daily drink choices. Ask only one question and keep it brief and engaging.";
          else if (answerCount === 1)
            prompt = `The user answered '${userAnswers[0]}'. Now, ask a second, different personal question about *why* or *when* they make that drink choice. Ask only one question.`;
          else
            prompt = `The user's previous answers are '${userAnswers.join(', ')}'. Now, ask the third and final personal question about what healthy changes they might be interested in. Ask only one question.`;
        }
        break;

      case 'generate_quiz':
        expectsJson = true;
        prompt = `
You are an expert quiz creator for an Indian audience focused on health, drinks, and nutrition.
User preferences: "${userAnswers.join('. ')}", difficulty: '${difficulty}'.
Rules:
- Generate exactly 8 questions.
- Output a single JSON object: { "quiz": [ { "questionText": "...", "answers": ["a","b","c","d"], "correctAnswerIndex": 0 }, ... ] }
- Respond with only the JSON.`;
        break;

      case 'explain_wrong_answers':
        expectsJson = true;
        prompt = `You are a helpful health expert. For each question in this list: ${JSON.stringify(incorrectQuestions.map(q => ({ question: q.questionText, correctAnswer: q.answers[q.correctAnswerIndex] })))}, provide a clear, concise explanation. Respond only with a single JSON object: { "explanations": [ { "question": "...", "explanation": "..." }, ... ] }`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid stage provided.' });
    }

    const probe = await callPerplexityWithProbe(prompt, { top_k: 1 });

    if (!probe.success) {
      // Forward diagnostics to caller to aid troubleshooting
      return res.status(502).json({ error: 'Perplexity API error', diagnostics: probe.diagnostics });
    }

    const fullText = extractPerplexityText(probe.json, probe.text);

    if (expectsJson) {
      try {
        const firstJson = extractFirstJson(fullText);
        return res.json(JSON.parse(firstJson));
      } catch (err) {
        console.error('Failed to parse JSON from Perplexity for quiz-master:', err);
        console.error('Raw Perplexity text (truncated):', fullText.slice(0, 2000));
        return res.status(500).json({ error: 'AI returned invalid JSON.', raw: fullText, diagnostics: probe.diagnostics });
      }
    } else {
      return res.type('text/plain').send(fullText);
    }
  } catch (err) {
    console.error('/api/quiz-master error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// ---------------------------
// Health AI Chatbot (Perplexity)
app.post('/api/health-ai', async (req, res) => {
  const { history } = req.body;
  const userMessageCount = (history || []).filter(item => item.role === 'user').length;
  const isFinalQuestion = userMessageCount >= 10;

  const basePrompt = `You are a friendly and empathetic Health AI assistant named SipWise AI. Your goal is to understand a user's general health and wellness habits by asking a series of up to 10 conversational questions. You must never give direct medical advice. Instead, provide general wellness tips, suggest positive lifestyle changes, and strongly recommend consulting a doctor for any personal health problems. Your tone should be supportive and encouraging.`;

  let finalPrompt;
  if (isFinalQuestion) {
    finalPrompt = `${basePrompt} The 10-question interview is now complete. Based on the entire conversation history, provide a comprehensive, detailed, and encouraging wellness summary for the user. Structure response with sections: Overall Wellness Summary; Key Areas for Improvement; Detailed Suggestions & Rationale; A Positive Outlook. End with exact disclaimer: "Disclaimer: This is an AI-generated wellness summary, not medical advice. Please consult a healthcare professional for any health concerns."`;
  } else if (!history || history.length === 0) {
    finalPrompt = `${basePrompt} Start the conversation by introducing yourself and asking the very first question about the user's primary wellness goal or concern.`;
  } else {
    const flatten = history.map(h => {
      if (h.role && h.parts && Array.isArray(h.parts)) return `${h.role.toUpperCase()}: ${h.parts.map(p => p.text).join(' ')}`;
      if (h.role && h.content) return `${h.role.toUpperCase()}: ${h.content}`;
      return `${h.role || 'user'}: (no text)`;
    }).join('\n\n');
    finalPrompt = `${basePrompt}\n\nConversation so far:\n\n${flatten}\n\nContinue by asking the next relevant question (ask only one question).`;
  }

  try {
    const probe = await callPerplexityWithProbe(finalPrompt, { top_k: 1 });
    if (!probe.success) {
      return res.status(502).json({ error: 'Perplexity API error', diagnostics: probe.diagnostics });
    }
    const answer = extractPerplexityText(probe.json, probe.text);
    res.json({ response: answer, isFinal: isFinalQuestion, diagnostics: probe.diagnostics });
  } catch (err) {
    console.error('/api/health-ai error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to get a response from Perplexity.' });
  }
});

// ---------------------------
// Image generation endpoint (Stability) - unchanged behavior
app.post('/api/generate-real-image', async (req, res) => {
  const { userPrompt, uid } = req.body;
  if (!userPrompt) return res.status(400).json({ error: 'A text prompt is required.' });
  if (!STABILITY_API_KEY) return res.status(500).json({ error: 'Stability AI API key not configured.' });

  try {
    const formData = new FormData();
    formData.append('prompt', userPrompt);
    formData.append('model', 'sd3');
    formData.append('aspect_ratio', '1:1');
    formData.append('output_format', 'jpeg');

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        Accept: 'application/json'
      },
      body: formData
    });

    if (!response.ok) {
      const errorDetails = await response.text().catch(() => '<non-text response>');
      console.error('--- STABILITY AI FAILED ---', errorDetails);
      return res.status(502).json({ error: 'Image generation failed', details: errorDetails });
    }

    const data = await response.json();
    let base64Image = null;
    if (data.image && typeof data.image === 'string') base64Image = data.image;
    else if (data.artifacts && data.artifacts[0]) {
      const art = data.artifacts[0];
      base64Image = art.base64 || art.b64 || art.b64_json || art.image || null;
    } else if (data.output && data.output[0] && data.output[0].b64_json) base64Image = data.output[0].b64_json;

    if (!base64Image) return res.status(502).json({ error: 'Unexpected response shape from Stability AI', raw: data });

    const imageBuffer = Buffer.from(base64Image, 'base64');
    const bucket = admin.storage ? admin.storage().bucket() : null;
    if (!bucket) {
      return res.json({ base64: base64Image });
    }

    const fileName = `images/${uid || 'public'}/${uuidv4()}.jpeg`;
    const file = bucket.file(fileName);
    await file.save(imageBuffer, { metadata: { contentType: 'image/jpeg' } });
    try { await file.makePublic(); } catch (_) {}
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    if (uid && db) {
      await db.collection('users').doc(uid).set({ imageGallery: admin.firestore.FieldValue.arrayUnion(publicUrl) }, { merge: true });
    }

    res.json({ imageUrl: publicUrl });
  } catch (err) {
    console.error('/api/generate-real-image error:', err && (err.stack || err));
    res.status(500).json({ error: err.message || String(err) });
  }
});

// ---------------------------
// Daily Challenge, Leaderboard, Points, Activity (same as before)
const dailyChallenges = [
  { title: 'Hydration Hero', description: 'Drink 8 glasses of water today.', points: 20 },
  { title: 'Sugar Swap', description: 'Swap one sugary soda for a healthy alternative like lemon water or unsweetened tea.', points: 30 },
  { title: 'Move Your Body', description: 'Do 20 minutes of light exercise like walking or stretching.', points: 25 },
  { title: 'Mindful Sipping', description: 'Take a moment to read the ingredients list on a beverage you drink today.', points: 15 },
  { title: 'Fruit Power', description: 'Eat one whole fruit instead of drinking a packaged juice.', points: 25 },
  { title: 'Share the Knowledge', description: 'Share one health fact you learned from SipWise with a friend or family member.', points: 20 },
  { title: 'Early Bird Hydration', description: 'Drink a glass of water within 10 minutes of waking up.', points: 15 }
];

app.get('/api/daily-challenge', (req, res) => {
  const dayIndex = getDayOfYear(new Date()) % dailyChallenges.length;
  res.json(dailyChallenges[dayIndex]);
});

app.post('/api/complete-challenge', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'User ID is required.' });
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    const today = new Date().toISOString().split('T')[0];
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found.' });
    const userData = doc.data();
    if (userData.lastChallengeCompleted === today) return res.status(409).json({ error: 'Challenge already completed today.' });
    const challenge = dailyChallenges[getDayOfYear(new Date()) % dailyChallenges.length];
    const newPoints = (userData.hydroPoints || 0) + challenge.points;
    await userRef.set({ hydroPoints: newPoints, lastChallengeCompleted: today }, { merge: true });
    res.json({ success: true, pointsAwarded: challenge.points, newTotal: newPoints });
  } catch (err) {
    console.error('/api/complete-challenge error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to complete challenge.' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    const usersSnapshot = await db.collection('users').orderBy('hydroPoints', 'desc').limit(10).get();
    const leaderboard = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return { uid: doc.id, displayName: data.displayName || 'Anonymous', photoURL: data.photoURL || 'https://i.ibb.co/6yvC0rT/default-avatar.png', hydroPoints: data.hydroPoints || 0 };
    });
    res.json(leaderboard);
  } catch (err) {
    console.error('/api/leaderboard error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

app.get('/api/points/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({ hydroPoints: 0 });
      return res.json({ hydroPoints: 0 });
    }
    res.json(doc.data());
  } catch (err) {
    console.error('/api/points error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to fetch points.' });
  }
});

app.post('/api/points', async (req, res) => {
  try {
    const { uid, points } = req.body;
    if (!uid || points === undefined) return res.status(400).json({ error: 'User ID and points are required.' });
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    await db.collection('users').doc(uid).set({ hydroPoints: points }, { merge: true });
    res.json({ success: true, newTotal: points });
  } catch (err) {
    console.error('/api/points POST error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to update points.' });
  }
});

// Activity endpoints
app.post('/api/activity/quiz', async (req, res) => {
  try {
    const { uid, quizData } = req.body;
    if (!uid || !quizData) return res.status(400).json({ error: 'User ID and quiz data are required.' });
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    const historyEntry = { ...quizData, timestamp: new Date() };
    await db.collection('users').doc(uid).collection('quizHistory').add(historyEntry);
    res.json({ success: true });
  } catch (err) {
    console.error('/api/activity/quiz error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to save quiz history.' });
  }
});

app.post('/api/activity/interview-answers', async (req, res) => {
  try {
    const { uid, answers } = req.body;
    if (!uid || !answers) return res.status(400).json({ error: 'User ID and answers are required.' });
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    await db.collection('users').doc(uid).set({ interviewAnswers: answers }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    console.error('/api/activity/interview-answers error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to save answers.' });
  }
});

app.get('/api/activity/quiz-history/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    const snapshot = await db.collection('users').doc(uid).collection('quizHistory').orderBy('timestamp', 'desc').limit(10).get();
    const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(history);
  } catch (err) {
    console.error('/api/activity/quiz-history error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to fetch quiz history.' });
  }
});

app.get('/api/activity/health-tips/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;
    if (!db) return res.status(500).json({ error: 'Firestore not initialized.' });
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists || !userDoc.data().interviewAnswers) return res.status(404).json({ error: 'Interview answers not found for user.' });

    const answers = userDoc.data().interviewAnswers;
    const prompt = `Based on these user statements about their drink habits in India ("${answers.join('; ')}"), generate 3 short, actionable, and personalized health tips. Respond only with a single JSON object with one key: "tips", which is an array of 3 tip strings. Respond with only valid JSON.`;

    const probe = await callPerplexityWithProbe(prompt);
    if (!probe.success) return res.status(502).json({ error: 'Perplexity API error', diagnostics: probe.diagnostics });

    try {
      const firstJson = extractFirstJson(extractPerplexityText(probe.json, probe.text));
      const parsed = JSON.parse(firstJson);
      return res.json(parsed);
    } catch (err) {
      console.error('Failed to parse JSON from Perplexity for health-tips:', err);
      return res.status(500).json({ error: 'AI returned invalid JSON for health tips.', raw: probe.text, diagnostics: probe.diagnostics });
    }
  } catch (err) {
    console.error('/api/activity/health-tips error:', err && (err.stack || err));
    res.status(500).json({ error: 'Failed to generate health tips.' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Start server
app.listen(port, () => {
  console.log(`✅ Perplexity-backed AI Server listening at http://localhost:${port}`);
  console.log(` - Health: http://localhost:${port}/health`);
  console.log(` - Perplexity test: http://localhost:${port}/debug/test-perplexity-key`);
});