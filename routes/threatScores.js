var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

// POST /api/threat-scores - save a threat score for an email
router.post('/', async function(req, res) {
    const { email_id, score, label } = req.body;

    const { data, error } = await supabase
        .from('threat_scores')
        .insert([{ email_id, score, label }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
});

// GET /api/threat-scores - fetch all threat scores
router.get('/', async function(req, res) {
    const { data, error } = await supabase
        .from('threat_scores')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

module.exports = router;