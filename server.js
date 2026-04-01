const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ PUT YOUR REAL TOKEN HERE
const OPENAI_CHALLENGE_TOKEN = 'JFpngzRePk90mk3kyJM00ar-Aj7iTzUmhOWAego_KEw';

// ✅ Root route (for testing)
app.get('/', (_req, res) => {
  res.status(200).send('JobNova MCP Server Running');
});

// ✅ Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// ✅ DOMAIN VERIFICATION (CRITICAL)
app.get('/.well-known/openai-apps-challenge', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(OPENAI_CHALLENGE_TOKEN);
});

// ✅ MCP ENDPOINT (OpenAI will call this)
app.post('/mcp', async (req, res) => {
  try {
    const { method, params, id } = req.body || {};

    // ❌ Invalid request
    if (!method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: { code: -32600, message: 'Missing method' }
      });
    }

    // ✅ Tool discovery
    if (method === 'tools/list') {
      return res.json({
        jsonrpc: '2.0',
        id: id || null,
        result: {
          tools: [
            {
              name: 'analyze_resume',
              description: 'Analyze a resume and give feedback',
              input_schema: {
                type: 'object',
                properties: {
                  resume: { type: 'string' }
                },
                required: ['resume']
              }
            }
          ]
        }
      });
    }

    // ✅ Tool execution
    if (method === 'tools/call') {
      const tool = params?.name;
      const resume = params?.arguments?.resume || '';

      if (tool !== 'analyze_resume') {
        return res.status(404).json({
          jsonrpc: '2.0',
          id: id || null,
          error: { code: -32601, message: 'Tool not found' }
        });
      }

      return res.json({
        jsonrpc: '2.0',
        id: id || null,
        result: {
          content: [
            {
              type: 'text',
              text:
                'Resume analysis:\n' +
                '- Add measurable achievements\n' +
                '- Improve ATS keywords\n' +
                '- Strengthen summary section\n\n' +
                'Preview:\n' +
                resume.slice(0, 200)
            }
          ]
        }
      });
    }

    // ❌ Unknown method
    return res.status(400).json({
      jsonrpc: '2.0',
      id: id || null,
      error: { code: -32601, message: 'Method not supported' }
    });

  } catch (error) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32000, message: error.message }
    });
  }
});

// ✅ IMPORTANT: Render uses dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});