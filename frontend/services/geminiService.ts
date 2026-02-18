import { GoogleGenAI, Chat, Type } from '@google/genai';

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set. AI features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey, vertexai: true });
};

export const analyzeIncident = async (title: string, description: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      You are an expert IT Service Management AI.
      Analyze the following incident:
      Title: ${title}
      Description: ${description}

      Provide a concise response with:
      1. Potential Root Causes (list 2-3)
      2. Suggested Troubleshooting Steps
      3. Recommended Priority Level based on description
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Error analyzing incident:", error);
    return "Failed to generate analysis. Please try again.";
  }
};

export const generateRCA = async (problemTitle: string, problemDesc: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      Generate a Root Cause Analysis (RCA) draft for the following IT problem:
      Problem: ${problemTitle}
      Details: ${problemDesc}

      Format the output with markdown headers for:
      - Executive Summary
      - Technical Analysis
      - Corrective Actions
      - Preventive Measures
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No RCA generated.";
  } catch (error) {
    console.error("Error generating RCA:", error);
    return "Failed to generate RCA.";
  }
};

export const assessChangeRisk = async (changeTitle: string, changeDesc: string, type: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      Perform a Risk Assessment for this IT Change Request:
      Title: ${changeTitle}
      Description: ${changeDesc}
      Type: ${type}

      Provide:
      1. Risk Score (Low/Medium/High) with justification.
      2. Potential Impact on Services.
      3. Recommended Back-out Plan suggestions.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No risk assessment generated.";
  } catch (error) {
    console.error("Error assessing risk:", error);
    return "Failed to assess risk.";
  }
};

export const generateLeanBusinessCase = async (title: string, description: string, strategicTheme: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      Draft a Lean Business Case for the following Portfolio Epic:
      Title: ${title}
      Description: ${description}
      Strategic Theme: ${strategicTheme}

      Please structure the response with the following sections (Markdown format):
      1. **Problem Statement**: What problem are we solving?
      2. **Business Outcomes Hypothesis**: What are the expected benefits?
      3. **Leading Indicators**: How will we measure success early?
      4. **Non-Functional Requirements (NFRs)**: Security, compliance, performance, etc.
      5. **MVP Definition**: What is the minimum viable product?
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No business case generated.";
  } catch (error) {
    console.error("Error generating business case:", error);
    return "Failed to generate business case.";
  }
};

export const generateWBS = async (title: string, description: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      Create a Work Breakdown Structure (WBS) for the following Portfolio Epic:
      Title: ${title}
      Description: ${description}

      Please structure the response with the following sections (Markdown format):
      1. **Phases**: High-level phases of the project.
      2. **Key Deliverables**: What will be produced in each phase.
      3. **Major Activities**: List of key activities required to complete the deliverables.
      4. **Estimated Timeline**: Rough timeline estimation for the phases.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No WBS generated.";
  } catch (error) {
    console.error("Error generating WBS:", error);
    return "Failed to generate WBS.";
  }
};

export const generateGanttData = async (title: string, description: string, wbs: string): Promise<any[]> => {
  const ai = getAIClient();
  if (!ai) return [];

  try {
    const prompt = `
      Generate a GANTT chart project schedule for:
      Title: ${title}
      Description: ${description}
      Work Breakdown Structure context: ${wbs}

      Assume the project starts today (${new Date().toISOString().split('T')[0]}).
      Create a realistic timeline with phases and tasks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              start: { type: Type.STRING, description: "YYYY-MM-DD format" },
              end: { type: Type.STRING, description: "YYYY-MM-DD format" },
              type: { type: Type.STRING, enum: ["phase", "task"] },
              progress: { type: Type.NUMBER }
            },
            required: ["id", "name", "start", "end", "type", "progress"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating GANTT:", error);
    return [];
  }
};

export const createSupportChatSession = (): Chat | null => {
  const ai = getAIClient();
  if (!ai) return null;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are a helpful IT Service Desk virtual assistant. Your goal is to help employees resolve technical issues (e.g., password resets, software installation, hardware troubleshooting) or find items in the service catalog. Be concise, polite, and professional. If you cannot resolve the issue, suggest that the user creates an incident ticket.",
    }
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const analyzeRisk = async (title: string, description: string, category: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      Act as an ISO 31000 Risk Management Expert. Analyze the following risk:
      Risk Title: ${title}
      Description: ${description}
      Category: ${category}

      Provide a structured analysis including:
      1. **Potential Consequences**: What could happen if this risk materializes?
      2. **Recommended Mitigation Strategies**: Suggest specific actions to Avoid, Reduce, Share, or Accept this risk.
      3. **Key Risk Indicators (KRIs)**: What metrics should be monitored to detect this risk early?
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No risk analysis generated.";
  } catch (error) {
    console.error("Error analyzing risk:", error);
    return "Failed to generate risk analysis.";
  }
};

export const analyzeAICompliance = async (name: string, description: string, frameworks: string[], dataCategories: string[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "AI Configuration missing.";

  try {
    const prompt = `
      Act as an AI Compliance Officer. Analyze the following AI Service for compliance:
      Service Name: ${name}
      Description: ${description}
      Target Frameworks: ${frameworks.join(', ')}
      Processed Data: ${dataCategories.join(', ')}

      Provide a compliance assessment including:
      1. **Risk Classification**: Determine the risk level (Unacceptable, High, Limited, Minimal) based on the EU AI Act logic.
      2. **Key Compliance Requirements**: List the top 3-5 requirements for the selected frameworks.
      3. **Gap Analysis**: Potential gaps based on the description and data processed.
      4. **Recommendations**: Steps to achieve compliance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "No compliance analysis generated.";
  } catch (error) {
    console.error("Error analyzing AI compliance:", error);
    return "Failed to generate compliance analysis.";
  }
};
