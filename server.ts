import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { StartupIdea, IdeaLog } from "./src/types";

// Database file path
const DB_PATH = path.join(process.cwd(), "db.json");

// Helper to read and write local JSON database
async function getDb(): Promise<{ ideas: StartupIdea[] }> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with empty array
    const initial = { ideas: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function saveDb(data: { ideas: StartupIdea[] }) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Lazy Gemini client initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Route: Get all ideas (History)
  app.get("/api/ideas", async (req, res) => {
    try {
      const db = await getDb();
      // Sort with newest first
      const sorted = [...db.ideas].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(sorted);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch past ideas" });
    }
  });

  // API Route: Get specific idea evaluation details
  app.get("/api/ideas/:id", async (req, res) => {
    try {
      const db = await getDb();
      const idea = db.ideas.find((i) => i.id === req.params.id);
      if (!idea) {
        return res.status(404).json({ error: "Startup idea not found" });
      }
      res.json(idea);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch idea details" });
    }
  });

  // API Route: Submit new startup idea for validation
  app.post("/api/ideas", async (req, res) => {
    try {
      const { title, description, targetMarket, extraContext } = req.body;

      if (!title || !description || !targetMarket) {
        return res.status(400).json({ error: "Title, description, and target market are required." });
      }

      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();

      const newIdea: StartupIdea = {
        id,
        title,
        description,
        targetMarket,
        extraContext,
        createdAt,
        status: "processing",
        logs: [
          {
            timestamp: new Date().toISOString(),
            agent: "System",
            message: "Startup idea submitted and queued for intelligence processing.",
          },
        ],
      };

      // Store in DB in processing status
      const db = await getDb();
      db.ideas.push(newIdea);
      await saveDb(db);

      // Respond immediately with the idea object, start AI pipeline asynchronously
      res.status(202).json(newIdea);

      // Launch async multi-agent validation pipeline
      runValidationPipeline(id).catch(async (err) => {
        console.error(`Error in validation pipeline for idea ${id}:`, err);
        const dbUpdate = await getDb();
        const ideaIdx = dbUpdate.ideas.findIndex((i) => i.id === id);
        if (ideaIdx !== -1) {
          dbUpdate.ideas[ideaIdx].status = "failed";
          dbUpdate.ideas[ideaIdx].error = err.message || "An unknown error occurred during validation.";
          dbUpdate.ideas[ideaIdx].logs.push({
            timestamp: new Date().toISOString(),
            agent: "System",
            message: `Pipeline failed: ${err.message || "Unknown error"}`,
          });
          await saveDb(dbUpdate);
        }
      });

    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to submit startup idea" });
    }
  });

  // API Route: Delete an idea
  app.delete("/api/ideas/:id", async (req, res) => {
    try {
      const db = await getDb();
      const index = db.ideas.findIndex((i) => i.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Idea not found" });
      }
      db.ideas.splice(index, 1);
      await saveDb(db);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete idea" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Multi-agent pipeline simulator using Gemini API
async function runValidationPipeline(ideaId: string) {
  const addLog = async (agent: IdeaLog["agent"], message: string) => {
    const db = await getDb();
    const idx = db.ideas.findIndex((i) => i.id === ideaId);
    if (idx !== -1) {
      db.ideas[idx].logs.push({
        timestamp: new Date().toISOString(),
        agent,
        message,
      });
      await saveDb(db);
    }
  };

  try {
    // 1. Retrieve the idea details
    let db = await getDb();
    const idea = db.ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    // Trigger Market Agent
    await addLog("Market", "Market Agent activated. Analyzing market size, dynamics, and consumer demand...");
    await delay(1500);

    // Trigger Competitor Agent
    await addLog("Competitor", "Competitor Agent activated. Scanning existing ecosystem, finding key incumbents and differentiation niches...");
    await delay(1500);

    // Trigger Risk Agent
    await addLog("Risk", "Risk Agent activated. Identifying hidden technical, legal, and operational vulnerabilities...");
    await delay(1500);

    // Trigger SWOT Agent
    await addLog("SWOT", "SWOT Agent activated. Synthesizing comprehensive internal strengths and external market opportunities...");
    await delay(1500);

    // Trigger System Fusion
    await addLog("System", "Fusing intelligence vectors and initiating Gemini inference schema...");

    const ai = getGeminiClient();

    const systemPrompt = `
      You are the Core Coordinator of an Elite Startup Validation & Multi-Agent Innovation Intelligence Platform.
      You orchestrate evaluations from 4 specialized agents:
      1. Market Agent (examines market dynamics, demand size, emerging trends, audience insight)
      2. Competitor Agent (profiles competitors, spots weaknesses, maps differentiation points)
      3. Risk Agent (identifies operational, regulatory, technical, and execution risks and mitigation strategies)
      4. SWOT Agent (forms Strengths, Weaknesses, Opportunities, and Threats)

      You must synthesize their reports and produce a structured JSON validation report matching the exact schema required.
      Compute sub-scores objectively:
      - marketDemand: score 0-100 based on audience insights & trends
      - feasibility: score 0-100 based on technical/financial complexity
      - riskMitigation: score 0-100 based on mitigatibility of risks
      - competitiveAdvantage: score 0-100 based on differentiation gap

      Calculate a synthesized overall viabilityScore (weighted average of subscores, or appropriate fusion).
      Be professional, realistic, critical yet constructive, and highly detailed.
    `;

    const userPrompt = `
      Startup Idea Title: "${idea.title}"
      Idea Description: "${idea.description}"
      Target Market: "${idea.targetMarket}"
      Optional Additional Context: "${idea.extraContext || 'None provided'}"

      Conduct the multi-agent validation. Return the structured result matching the requested JSON schema exactly.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            viabilityScore: {
              type: Type.INTEGER,
              description: "Synthesized general startup viability score from 0 to 100",
            },
            subScores: {
              type: Type.OBJECT,
              properties: {
                marketDemand: { type: Type.INTEGER, description: "Market demand subscore 0-100" },
                feasibility: { type: Type.INTEGER, description: "Technical and business feasibility subscore 0-100" },
                riskMitigation: { type: Type.INTEGER, description: "Risk and barrier mitigation score 0-100" },
                competitiveAdvantage: { type: Type.INTEGER, description: "Unique value proposition and competitive advantage score 0-100" },
              },
              required: ["marketDemand", "feasibility", "riskMitigation", "competitiveAdvantage"],
            },
            marketAnalysis: {
              type: Type.OBJECT,
              properties: {
                trends: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 key market trends or dynamics related to this space",
                },
                audienceInsights: {
                  type: Type.STRING,
                  description: "Detailed explanation of target audience behavior, pain points, and why they would adopt this",
                },
                opportunities: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Uncapped or emerging market opportunities for this startup",
                },
              },
              required: ["trends", "audienceInsights", "opportunities"],
            },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of strengths" },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of weaknesses" },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of opportunities" },
                threats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of threats" },
              },
              required: ["strengths", "weaknesses", "opportunities", "threats"],
            },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Competitor name (real or representative category)" },
                  description: { type: Type.STRING, description: "Brief description of their offering" },
                  weakness: { type: Type.STRING, description: "What they do poorly or where they miss the mark" },
                  differentiation: { type: Type.STRING, description: "How the user's startup can differentiate from them" },
                },
                required: ["name", "description", "weakness", "differentiation"],
              },
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Risk category (Regulatory, Technical, Market, Financial, Adoption)" },
                  description: { type: Type.STRING, description: "Detailed description of the risk" },
                  severity: { type: Type.STRING, description: "Must be one of: High, Medium, Low" },
                  mitigation: { type: Type.STRING, description: "Actionable strategy to mitigate or bypass this risk" },
                },
                required: ["category", "description", "severity", "mitigation"],
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Short actionable recommendation title" },
                  description: { type: Type.STRING, description: "Specific steps to implement" },
                  impact: { type: Type.STRING, description: "Must be one of: High, Medium, Low" },
                },
                required: ["title", "description", "impact"],
              },
            },
          },
          required: [
            "viabilityScore",
            "subScores",
            "marketAnalysis",
            "swot",
            "competitors",
            "risks",
            "recommendations",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini model.");
    }

    const report = JSON.parse(resultText);

    // Save final report inside the database
    db = await getDb();
    const idx = db.ideas.findIndex((i) => i.id === ideaId);
    if (idx !== -1) {
      db.ideas[idx] = {
        ...db.ideas[idx],
        status: "completed",
        viabilityScore: report.viabilityScore,
        subScores: report.subScores,
        marketAnalysis: report.marketAnalysis,
        swot: report.swot,
        competitors: report.competitors,
        risks: report.risks,
        recommendations: report.recommendations,
      };
      
      db.ideas[idx].logs.push({
        timestamp: new Date().toISOString(),
        agent: "System",
        message: "Startup validation analysis completed successfully.",
      });

      await saveDb(db);
    }

  } catch (error: any) {
    console.error(`Error validating startup idea ${ideaId}:`, error);
    await addLog("System", `Error encountered: ${error.message || error}`);
    throw error;
  }
}

// Utility delay function
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

startServer();
