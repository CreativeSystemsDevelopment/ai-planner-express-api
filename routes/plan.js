const express = require('express');
const axios = require('axios');
const router = express.Router();

// Google Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// POST /api/plan - Generate development plan
router.post('/', async (req, res) => {
  try {
    const { prompt, format = 'json', for: targetFor } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'prompt is required'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Gemini API key not configured'
      });
    }

    console.log(`📝 Generating plan for: "${prompt}" (format: ${format}, for: ${targetFor || 'all'})`);

    // Build the system prompt based on target
    let systemPrompt = '';
    if (targetFor === 'supervisor') {
      systemPrompt = buildSupervisorPrompt();
    } else {
      systemPrompt = buildFullPlanPrompt();
    }

    // Call Gemini API
    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser Request: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const generatedText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response generated from Gemini API');
    }

    console.log('✅ Plan generated successfully');

    // Parse and return JSON response
    if (format === 'json') {
      try {
        // Extract JSON from the response
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonResponse = JSON.parse(jsonMatch[0]);
          return res.json(jsonResponse);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        return res.status(500).json({
          error: 'Response Parse Error',
          message: 'Failed to parse generated plan as JSON',
          rawResponse: generatedText
        });
      }
    } else {
      // Return raw text
      return res.json({
        plan: generatedText,
        format: 'text'
      });
    }

  } catch (error) {
    console.error('Plan generation error:', error);
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request Timeout',
        message: 'The AI service took too long to respond. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate development plan',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/plan/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Plan API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/plan': 'Generate development plan',
      'GET /api/plan/test': 'Test endpoint'
    }
  });
});

function buildFullPlanPrompt() {
  return `You are an AI Software Development Project Planner Expert. Your role is to analyze user requests and create comprehensive, structured development plans.

CORE METHODOLOGY:
1. **Research-Driven Analysis**: Thoroughly analyze the user's request to understand the project type, complexity, and requirements
2. **Algorithmic Project Matching**: Use pattern recognition to match the request against common software project archetypes
3. **Systematic Task Decomposition**: Break down the project into atomic, manageable tasks with clear dependencies
4. **Agent Specialization Strategy**: Assign tasks to specialized AI agents based on skill requirements

RESPONSE FORMAT:
Return a JSON object with the following structure:

{
  "agentSpecifications": [
    {
      "name": "AgentName",
      "description": "Detailed description of agent's specialization and responsibilities"
    }
  ],
  "agentSupervisorDirectives": {
    "overview": "How the supervisor should coordinate agents",
    "directives": [
      {
        "agentName": "AgentName",
        "systemPromptTemplate": "Template with {{TASK_DESCRIPTION}}, {{TASK_DEPENDENCIES}}, {{EXPECTED_OUTPUT}} placeholders"
      }
    ]
  },
  "executionPlan": {
    "overview": "High-level execution strategy",
    "taskDependencyGraph": {
      "diagram": "Mermaid syntax dependency graph"
    },
    "taskList": [
      {
        "id": "TASK-001",
        "agentSpecialization": "AgentName",
        "description": "Detailed task description",
        "dependencies": ["TASK-000"],
        "output": "Expected deliverable"
      }
    ]
  },
  "supervisorExecutionPlan": {
    "overview": "Supervisor coordination strategy",
    "jsonRepresentation": "Machine-readable task list",
    "textualRepresentation": "Human-readable dependency flow"
  },
  "systemArchitecture": {
    "overview": "Technical architecture description",
    "diagram": "Mermaid syntax architecture diagram"
  },
  "techStack": {
    "methodology": "Development methodology",
    "technologies": [
      {
        "category": "Frontend Framework",
        "name": "Technology Name",
        "reason": "Why this technology was chosen"
      }
    ]
  }
}

AGENT SPECIALIZATIONS:
- FrontendAgent: UI components, user interactions, responsive design
- BackendAgent: APIs, business logic, data processing
- DatabaseAgent: Schema design, data modeling, queries
- InfrastructureAgent: DevOps, deployment, environment setup
- TestingAgent: Test strategies, quality assurance
- SecurityAgent: Authentication, authorization, security practices
- DocumentationAgent: Technical documentation, user guides

TASK DECOMPOSITION PRINCIPLES:
1. Each task should be completable by a single agent
2. Tasks should have clear, measurable outputs
3. Dependencies should be explicit and acyclic
4. Parallel execution should be maximized where possible
5. Critical path should be identified and optimized

Focus on creating actionable, implementable plans that can be executed by AI agents working in coordination.`;
}

function buildSupervisorPrompt() {
  return `You are an AI Agent Supervisor specializing in coordinating software development teams. Your role is to create agent specifications and task coordination strategies.

FOCUS: Generate agent specifications and supervisor directives for coordinating AI agents in software development.

RESPONSE FORMAT:
Return only the agentSpecifications and agentSupervisorDirectives sections in JSON format:

{
  "agentSpecifications": [
    {
      "name": "AgentName",
      "description": "Detailed description of agent's specialization and responsibilities"
    }
  ],
  "agentSupervisorDirectives": {
    "overview": "How the supervisor should coordinate agents",
    "directives": [
      {
        "agentName": "AgentName", 
        "systemPromptTemplate": "Template with {{TASK_DESCRIPTION}}, {{TASK_DEPENDENCIES}}, {{EXPECTED_OUTPUT}} placeholders"
      }
    ]
  }
}

AGENT TYPES:
- FrontendAgent: UI/UX, components, user interactions
- BackendAgent: APIs, business logic, data processing  
- DatabaseAgent: Schema, queries, data modeling
- InfrastructureAgent: DevOps, deployment, configuration
- TestingAgent: Quality assurance, test strategies
- SecurityAgent: Authentication, security practices

Focus on creating clear agent roles and coordination strategies.`;
}

module.exports = router;