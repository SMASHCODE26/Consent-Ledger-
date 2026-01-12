// Backend trust boundary
// All consent enforcement must happen here


import express from 'express'
import cors from 'cors'
import supabase from './supabaseClient.js'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('ConsentLedger backend running')
})

// Test Supabase connection
app.get('/health', async (req, res) => {
  const { data, error } = await supabase
    .from('consents')
    .select('*')
    .limit(1)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ status: 'ok', data })
})

app.post('/consent', async (req, res) => {
  const { user_id, app_id, data_type, purpose, expires_at } = req.body

  // Basic validation
  if (!user_id || !app_id || !data_type || !purpose) {
    return res.status(400).json({
      error: 'Missing required fields'
    })
  }

  try {
    const { data, error } = await supabase
      .from('consents')
      .insert([
        {
          user_id,
          app_id,
          data_type,
          purpose,
          status: 'active',
          expires_at
        }
      ])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Consent granted',
      consent: data[0]
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/data-access', async (req, res) => {
  const { user_id, app_id, data_type, purpose } = req.body

  if (!user_id || !app_id || !data_type || !purpose) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Find valid consent
    const { data: consents, error } = await supabase
      .from('consents')
      .select('*')
      .eq('user_id', user_id)
      .eq('app_id', app_id)
      .eq('data_type', data_type)
      .eq('purpose', purpose)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1)

    let allowed = consents && consents.length > 0
    let reason = allowed ? null : 'No valid consent'

    // 2. Log access attempt
    await supabase.from('access_logs').insert([
      {
        user_id,
        app_id,
        data_type,
        purpose,
        result: allowed ? 'allowed' : 'denied',
        reason
      }
    ])

    // 3. Respond
    if (!allowed) {
      return res.status(403).json({
        allowed: false,
        reason
      })
    }

    res.json({
      allowed: true,
      message: 'Access granted'
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/consent/revoke', async (req, res) => {
  const { consent_id } = req.body

  if (!consent_id) {
    return res.status(400).json({ error: 'consent_id is required' })
  }

  try {
    const { data, error } = await supabase
      .from('consents')
      .update({ status: 'revoked' })
      .eq('id', consent_id)
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Consent not found' })
    }

    res.json({
      message: 'Consent revoked successfully',
      consent: data[0]
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/consents/:user_id', async (req, res) => {
  const { user_id } = req.params

  try {
    const { data, error } = await supabase
      .from('consents')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ consents: data })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/logs/:user_id', async (req, res) => {
  const { user_id } = req.params

  try {
    const { data, error } = await supabase
      .from('access_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ logs: data })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})



const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
