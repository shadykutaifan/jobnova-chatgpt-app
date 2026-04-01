const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Use the exact token shown in your OpenAI Apps dashboard
const OPENAI_CHALLENGE_TOKEN = 'JFpngzRePk90mk3kyJM00ar-Aj7iTzUmhOWAego_KEw';

const TOOL_DEFINITION = {
  name: 'analyze_resume',
  description: 'Analyze a resume and give feedback',
  input_schema: {
    type: 'object',
    properties: {
      resume: { type: 'string' }
    },
    required: ['resume']
  }
};

function buildToolList(id = null) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      tools: [TOOL_DEFINITION]
    }
  };
}

function buildToolCallResult(id = null, resume = '') {
  return {
    jsonrpc: '2.0',
    id,
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
            String(resume).slice(0, 200)
        }
      ]
    }
  };
}

// Root route
app.get('/', (_req, res) => {
  res.status(200).send('JobNova MCP Server Running');
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'jobnova-chatgpt-app' });
});

// OpenAI domain verification
app.get('/.well-known/openai-apps-challenge', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(OPENAI_CHALLENGE_TOKEN);
});

// Some scanners probe MCP with GET
app.get('/mcp', (_req, res) => {
  return res.status(200).json(buildToolList(null));
});

// MCP endpoint
app.post('/mcp', async (req, res) => {
  try {
    const body = req.body || {};
    const { method, params, id } = body;

    // Empty-body fallback
    if (!body || Object.keys(body).length === 0 || !method) {
      return res.status(200).json(buildToolList(null));
    }

    // Tool discovery
    if (method === 'tools/list' || method === 'list_tools') {
      return res.status(200).json(buildToolList(id || null));
    }

    // Tool execution
    if (method === 'tools/call' || method === 'call_tool') {
      const toolName = params?.name || body.tool;
      const resume =
        params?.arguments?.resume ||
        body.input?.resume ||
        '';

      if (toolName !== 'analyze_resume') {
        return res.status(404).json({
          jsonrpc: '2.0',
          id: id || null,
          error: {
            code: -32601,
            message: 'Tool not found'
          }
        });
      }

      return res.status(200).json(buildToolCallResult(id || null, resume));
    }

    // Generic fallback for scanners expecting a tool list anyway
    return res.status(200).json(buildToolList(id || null));
  } catch (error) {
    return res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32000,
        message: error.message || 'Internal server error'
      }
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});