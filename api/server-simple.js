const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { runScan } = require('./scanner')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Scan endpoint
app.post('/scan', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        code: 'MISSING_URL'
      })
    }

    console.log(`Starting scan for: ${url}`)
    const results = await runScan(url)
    
    res.json({
      success: true,
      data: results,
      meta: {
        scannedAt: new Date().toISOString(),
        scannerVersion: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Scan error:', error)
    res.status(500).json({
      error: 'Scan failed',
      message: error.message,
      code: 'SCAN_ERROR'
    })
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'PrivacyScan API',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      scan: 'POST /scan'
    }
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`PrivacyScan API running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
