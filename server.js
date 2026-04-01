app.post('/mcp', async (req, res) => {
  const { method, params } = req.body || {};

  // MCP tool discovery
  if (method === "tools/list") {
    return res.json({
      tools: [
        {
          name: "analyze_resume",
          description: "Analyze a resume and provide feedback",
          input_schema: {
            type: "object",
            properties: {
              resume: { type: "string" }
            },
            required: ["resume"]
          }
        }
      ]
    });
  }

  // MCP tool execution
  if (method === "tools/call") {
    const { name, arguments: args } = params || {};

    if (name === "analyze_resume") {
      return res.json({
        content: [
          {
            type: "text",
            text: `Resume analysis:
- Strong foundation
- Add measurable results
- Improve ATS keywords

Preview:
${(args?.resume || "").substring(0, 200)}`
          }
        ]
      });
    }
  }

  res.status(400).json({ error: "Invalid MCP request" });
});