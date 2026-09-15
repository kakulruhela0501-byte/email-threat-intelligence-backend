var express = require('express');
var router = express.Router();
var supabase = require('../supabaseClient');

// GET /api/dashboard/emails-full - emails combined with threat score, location, forensic log
router.get('/emails-full', async function(req, res) {
    const { data: emails, error: emailError } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false });

    if (emailError) {
        return res.status(500).json({ error: emailError.message });
    }

    const { data: scores } = await supabase.from('threat_scores').select('*');
    const { data: locations } = await supabase.from('sender_locations').select('*');
    const { data: logs } = await supabase.from('forensic_logs').select('*');

    const combined = emails.map(email => ({
        ...email,
        threat: (scores || []).find(s => s.email_id === email.id) || null,
        location: (locations || []).find(l => l.email_id === email.id) || null,
        forensic: (logs || []).find(f => f.email_id === email.id) || null
    }));

    res.json(combined);
});

// GET /api/dashboard/stats - summary numbers for dashboard cards
router.get('/stats', async function(req, res) {
    const { count: totalEmails } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true });

    const { data: scores } = await supabase.from('threat_scores').select('label');

    const dangerous = (scores || []).filter(s => s.label === 'dangerous').length;
    const suspicious = (scores || []).filter(s => s.label === 'suspicious').length;
    const safe = (scores || []).filter(s => s.label === 'safe').length;

    const { data: locations } = await supabase.from('sender_locations').select('country');
    const countryCounts = {};
    (locations || []).forEach(l => {
        if (l.country) countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
    });

    res.json({
        total_emails: totalEmails || 0,
        dangerous_count: dangerous,
        suspicious_count: suspicious,
        safe_count: safe,
        top_locations: countryCounts
    });
});

module.exports = router;