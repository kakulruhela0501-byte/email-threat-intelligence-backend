var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

const AI_URL = 'https://email-threat-platform-ekvb.onrender.com/predict';

// POST /api/emails - save a new email + get AI threat prediction
router.post('/', async function(req, res) {
    const { sender, subject, body } = req.body;

    // Step 1: Save the email
    const { data: emailData, error: emailError } = await supabase
        .from('emails')
        .insert([{ sender, subject, body }])
        .select();

    if (emailError) {
        console.error('SUPABASE ERROR:', emailError);
        return res.status(500).json({ error: emailError.message });
    }

    const savedEmail = emailData[0];

    // Step 2: Call AI service to get prediction
    let label = 'unknown';
    try {
        const aiResponse = await fetch(AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body, sender })
        });
        label = await aiResponse.json();
    } catch (aiError) {
        console.error('AI SERVICE ERROR:', aiError);
    }

    // Step 3: Save the threat score/label
    await supabase
        .from('threat_scores')
        .insert([{ email_id: savedEmail.id, label: label, score: null }]);

    res.status(201).json({ email: savedEmail, threat_label: label });
});

// GET /api/emails
router.get('/', async function(req, res) {
    const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false });

    if (error) {
        console.error('SUPABASE ERROR:', error);
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

module.exports = router;
