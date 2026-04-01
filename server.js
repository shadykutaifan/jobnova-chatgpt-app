const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Replace this with the exact token shown on the OpenAI Apps page
const OPENAI_CHALLENGE_TOKEN = 'JFnpgzRePk9Omk3kyJM0Oar-Aj7iTzUMhOWAego_KEw';

app.get('/', (_req, res) => {
  res.status(200).send('JobNova MCP Server Running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'jobnova-chatgpt-app' });
});

// Domain verification route for OpenAI Apps
app.get('/.well-known/openai-apps-challenge', (_req, res) => {
  res.type('text/plain');
  res.send(OPENAI_CHALLENGE_TOKEN);
});

// Simple MCP-style endpoint
app.post('/mcp', async (req, res) => {
  try {
    const body = req.body || {};
    const { method, params, id } = body;

    // Basic validation
    if (!method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id ?? null,
        error: {
          code: -32600,
          message: 'Invalid Request: missing method'
        }
      });
    }

    // Tool discovery
    if (method === 'tools/list') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          tools: [
            {
              name: 'analyze_resume',
              description: 'Analyze a resume and provide basic feedback.',
              input_schema: {
                type: 'object',
                properties: {
                  resume: {
                    type: 'string',
                    description: 'The resume text to analyze.'
                  }
                },
                required: ['resume']
              }
            }
          ]
        }
      });
    }

    // Tool execution
    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName !== 'analyze_resume') {
        return res.status(404).json({
          jsonrpc: '2.0',
          id: id ?? null,
          error: {
            code: -32601,
            message: `Unknown tool: ${toolName}`
          }
        });
      }

      const resume = typeof args.resume === 'string' ? args.resume.trim() : '';

      if (!resume) {
        return res.status(400).json({
          jsonrpc: '2.0',
          id: id ?? null,
          error: {
            code: -32602,
            message: 'Invalid params: resume is required'
          }
        });
      }

      const preview = resume.slice(0, 300);

      return res.status(200).json({
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          content: [
            {
              type: 'text',
              text: [
                'Resume analysis:',
                '- Strong starting point',
                '- Add measurable achievements',
                '- Improve keyword alignment for ATS',
                '- Make formatting and section headings clearer',
                '',
                'Preview received:',
                preview
              ].join('\n')
            }
          ]
        }
      });
    }

    // Optional compatibility fallback for simpler scan attempts
    if (method === 'discover' || method === 'list_tools') {
      return res.status(200).json({
        jsonrpc: '2.0',
        id: id ?? null,
        result: {
          tools: [
            {
              name: 'analyze_resume',
              description: 'Analyze a resume and provide basic feedback.',
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

    return res.status(400).json({
      jsonrpc: '2.0',
      id: id ?? null,
      error: {
        code: -32601,
        message: `Method not supported: ${method}`
      }
    });
  } catch (error) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32000,
        message: error?.message || 'Internal server error'
      }
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});