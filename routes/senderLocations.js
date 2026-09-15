var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

// POST /api/sender-locations - save geolocation data for an email
router.post('/', async function(req, res) {
    const { email_id, ip_address, city, country, lat, lng } = req.body;

    const { data, error } = await supabase
        .from('sender_locations')
        .insert([{ email_id, ip_address, city, country, lat, lng }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
});

// GET /api/sender-locations - fetch all locations
router.get('/', async function(req, res) {
    const { data, error } = await supabase
        .from('sender_locations')
        .select('*');

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

module.exports = router;