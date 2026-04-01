app.post('/mcp', async (req, res) => {
  try {
    const body = req.body || {};
    const { method, params, id } = body;

    // ✅ SAFETY: handle empty calls (scanner sometimes sends {})
    if (!method) {
      return res.status(200).json({
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
      });
    }

    // ✅ STANDARD MCP LIST
    if (method === 'tools/list' || method === 'list_tools') {
      return res.status(200).json({
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
      });
    }

    // ✅ TOOL EXECUTION
    if (method === 'tools/call' || method === 'call_tool') {
      const tool = params?.name || body.tool;
      const resume = params?.arguments?.resume || body.input?.resume || '';

      if (tool !== 'analyze_resume') {
        return res.status(404).json({ error: 'Tool not found' });
      }

      return res.status(200).json({
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
      });
    }

    // ✅ fallback
    return res.status(200).json({
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
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});