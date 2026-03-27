require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Récupérer toutes les tables
app.get('/api/tables', async (req, res) => {
  const { data, error } = await supabase.from('tables').select('*').order('numero');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Récupérer tous les invités
app.get('/api/invites', async (req, res) => {
  const { data, error } = await supabase.from('invites').select('*').order('nom');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Marquer un invité comme présent
app.post('/api/invites/:id/present', async (req, res) => {
  const { id } = req.params;
  const { hotesse } = req.body;
  const { data, error } = await supabase
    .from('invites')
    .update({
      statut: 'present',
      heure_arrivee: new Date().toISOString(),
      checked_by: hotesse || 'Hôtesse'
    })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

// Annuler la présence d'un invité
app.post('/api/invites/:id/absent', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('invites')
    .update({
      statut: 'absent',
      heure_arrivee: null,
      checked_by: null
    })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error });
  res.json(data[0]);
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${process.env.PORT}`);
});
