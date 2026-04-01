const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Replace this with your real token from the OpenAI Apps page
const OPENAI_CHALLENGE_TOKEN = '18qODPuQOMXSD7TVXon79eEfVtNuPjH_XtnrOT64eAc';

app.get('/', (req, res) => {
  res.send('JobNova MCP Server Running');
});

app.get('/.well-known/openai-apps-challenge', (req, res) => {
  res.type('text/plain');
  res.send(OPENAI_CHALLENGE_TOKEN);
});

app.post('/mcp', async (req, res) => {
  try {
    const { tool, input } = req.body || {};

    // Tool discovery response
    if (!tool) {
      return res.json({
        tools: [
          {
            name: 'analyze_resume',
            description: 'Analyze a resume and provide feedback',
            input_schema: {
              type: 'object',
              properties: {
                resume: { type: 'string' }
              },
              required: ['resume']
            }
          }
        ]
      });
    }

    // Tool execution response
    if (tool === 'analyze_resume') {
      const resume = input?.resume || '';

      return res.json({
        success: true,
        result:
`Resume analysis:
- Good starting point
- Add measurable achievements
- Improve formatting and keyword alignment

Content received:
${resume.substring(0, 200)}`
      });
    }

    return res.status(400).json({ error: 'Unknown tool' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
});