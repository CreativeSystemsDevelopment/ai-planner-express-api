# AI Planner Express API

A dedicated Express.js **proxy backend** that exposes clean REST API endpoints for the AI Software Development Planner. This server acts as a bridge between AutoDev (and other development tools) and the Google Gemini AI service, providing structured project planning capabilities through well-defined HTTP endpoints.

## Features

- **🔗 Proxy Backend Architecture**: Clean REST endpoints that abstract away direct AI service integration
- **🌐 Multi-environment Support**: Works from Codespaces, local development, work/home PCs
- **🔒 Secure API Integration**: Handles Google Gemini API authentication and rate limiting
- **⚡ CORS Enabled**: Proper cross-origin request handling for web applications
- **🛠️ Comprehensive Error Handling**: Detailed error responses with proper HTTP status codes
- **📊 Health Monitoring**: Built-in health check endpoints for system monitoring
- **☁️ Vercel Ready**: Optimized for serverless deployment with automatic scaling

## Architecture

This Express.js server serves as a **proxy backend** that:

1. **Receives requests** from development tools (AutoDev, web interfaces, CLI tools)
2. **Transforms and validates** the request data 
3. **Communicates with Google Gemini API** using secure authentication
4. **Processes and structures** the AI-generated responses
5. **Returns clean JSON** via standardized REST endpoints

```
Development Tool → Express API → Google Gemini → Structured Response → Development Tool
    (AutoDev)         (Proxy)        (AI Service)     (JSON Plan)         (Agent Tasks)
```

This architecture provides:
- **Abstraction**: Tools don't need to handle AI service complexity
- **Security**: API keys are managed server-side
- **Consistency**: Standardized request/response formats
- **Reliability**: Error handling and retry logic
- **Scalability**: Serverless deployment with automatic scaling

## API Endpoints

### Plan Generation
- **POST** `/api/plan` - Generate development plan
- **GET** `/api/plan/test` - Test plan endpoint

### Health & Monitoring  
- **GET** `/api/health` - Basic health check
- **GET** `/api/health/detailed` - Detailed system information
- **GET** `/` - API documentation

## Usage

### Generate Development Plan

```bash
curl -X POST https://your-api-domain.vercel.app/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "web calculator app",
    "format": "json"
  }'
```

### From AutoDev (Rust)

```rust
let response = reqwest::post("https://your-api-domain.vercel.app/api/plan")
    .json(&serde_json::json!({
        "prompt": user_request,
        "format": "json"
    }))
    .send()
    .await?;

let plan: PlanResponse = response.json().await?;
```

## Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your Gemini API key to .env
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

4. **Test endpoints**:
   ```bash
   curl http://localhost:3000/api/health
   ```

## Deployment

### Vercel Deployment

1. **Create new Vercel project**:
   - Connect to your GitHub repository
   - Select the `express_server` directory as root

2. **Environment Variables**:
   Add to Vercel dashboard:
   - `GEMINI_API_KEY` or `API_KEY`: Your Google Gemini API key
   - `NODE_ENV`: `production`

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Request/Response Format

### Request Body
```json
{
  "prompt": "Description of project to plan",
  "format": "json",
  "for": "supervisor" // optional: "supervisor" or omit for full plan
}
```

### Response Format
```json
{
  "agentSpecifications": [...],
  "agentSupervisorDirectives": {...},
  "executionPlan": {...},
  "supervisorExecutionPlan": {...},
  "systemArchitecture": {...},
  "techStack": {...}
}
```

## Environment Variables

- `GEMINI_API_KEY` / `API_KEY`: Google Gemini API key (required)
- `NODE_ENV`: Environment mode (`development`/`production`)
- `PORT`: Server port (default: 3000)
- `CORS_ORIGINS`: Allowed CORS origins (production)

## Integration

This proxy backend is designed to integrate seamlessly with:

- **🤖 AutoDev**: Rust-based agent orchestration system
  ```rust
  let plan = reqwest::post("https://your-api.vercel.app/api/plan")
      .json(&serde_json::json!({"prompt": user_request, "format": "json"}))
      .send().await?.json::<PlanResponse>().await?;
  ```

- **🎨 AI Planner UI**: React-based planning interface (as backup/manual tool)

- **🔧 Development Tools**: Any system requiring structured project plans
  ```bash
  curl -X POST https://your-api.vercel.app/api/plan \
    -H "Content-Type: application/json" \
    -d '{"prompt": "web calculator", "format": "json"}'
  ```

- **📱 Mobile/Desktop Apps**: Native applications needing development planning

## Benefits of Proxy Architecture

- **🔐 Security**: API keys never exposed to client applications
- **📈 Scalability**: Serverless auto-scaling handles traffic spikes  
- **🛡️ Rate Limiting**: Built-in protection against API abuse
- **🔄 Reliability**: Centralized error handling and retry logic
- **🎯 Consistency**: Standardized responses across all integrations
- **🚀 Performance**: Optimized for fast response times

## License

MIT