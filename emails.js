var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

const AI_URL = 'https://email-threat-platform-ekvb.onrender.com/predict';

router.post('/', async function(req, res) {
    const { sender_email, recipient_email, subject, body } = req.body;

    const { data: emailData, error: emailError } = await supabase
        .from('emails')
        .insert([{ sender_email, recipient_email, subject, body }])
        .select();

    if (emailError) {
        return res.status(500).json({ error: emailError.message });
    }

    const savedEmail = emailData[0];

    let label = 'unknown';
    try {
        const aiResponse = await fetch(AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body, sender: sender_email })
        });
        label = await aiResponse.json();
    } catch (aiError) {}

    await supabase.from('threat_analysis').insert([{ email_id: savedEmail.id, label: label }]);

    res.status(201).json({ email: savedEmail, threat_label: label });
});

router.get('/', async function(req, res) {
    const { data, error } = await supabase.from('emails').select('*');
    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

module.exports = router;