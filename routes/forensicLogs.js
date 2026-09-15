var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

// POST /api/forensic-logs - save a forensic hash log for an email
router.post('/', async function(req, res) {
    const { email_id, hash } = req.body;

    const { data, error } = await supabase
        .from('forensic_logs')
        .insert([{ email_id, hash }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
});

// GET /api/forensic-logs - fetch all forensic logs
router.get('/', async function(req, res) {
    const { data, error } = await supabase
        .from('forensic_logs')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

module.exports = router;