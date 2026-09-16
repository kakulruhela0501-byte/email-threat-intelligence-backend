var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

// POST /api/emails - save a new email
router.post('/', async function(req, res) {
    const { sender, subject, body } = req.body;

    const { data, error } = await supabase
        .from('emails')
        .insert([{ sender, subject, body }])
        .select();

    if (error) {
        console.error('SUPABASE ERROR:', error);
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
});

// GET /api/emails - fetch all emails
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