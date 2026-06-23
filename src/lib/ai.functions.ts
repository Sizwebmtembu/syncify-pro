import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

const EmailInput = z.object({
  purpose: z.string().min(1).max(200),
  recipient: z.string().max(120).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  keyPoints: z.string().max(2000).optional().default(""),
  tone: z.enum(["Professional", "Friendly", "Formal", "Persuasive", "Urgent"]).default("Professional"),
  language: z.string().max(40).default("English"),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Write a complete ${data.tone.toLowerCase()} email in ${data.language}.
Purpose: ${data.purpose}
Recipient: ${data.recipient || "(unspecified)"}
Subject hint: ${data.subject || "(generate one)"}
Key points to include: ${data.keyPoints || "(infer reasonable content)"}

Return only the email itself with a "Subject:" line on the first line, then a blank line, then the body with greeting and sign-off. No commentary.`;
    const { text } = await generateText({ model: getModel(), prompt });
    return { email: text };
  });

const MeetingInput = z.object({
  transcript: z.string().min(20).max(50000),
});

const MeetingSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.object({ task: z.string(), owner: z.string(), deadline: z.string() })),
  participants: z.array(z.string()),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const { experimental_output } = await generateText({
      model: getModel(),
      experimental_output: Output.object({ schema: MeetingSchema }),
      prompt: `Analyze this meeting transcript/notes and produce a structured summary. Use empty strings like "Unassigned" or "TBD" if data is missing.\n\n---\n${data.transcript}`,
    });
    return experimental_output;
  });

const TaskInput = z.object({
  goals: z.string().min(1).max(2000),
  tasks: z.string().max(3000).optional().default(""),
  dueDate: z.string().max(40).optional().default(""),
  workingHours: z.string().max(80).optional().default("9am-5pm"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
});

const PlanSchema = z.object({
  daily: z.array(z.object({ time: z.string(), task: z.string(), priority: z.string() })),
  weekly: z.array(z.object({ day: z.string(), focus: z.string() })),
  priorityMatrix: z.object({
    urgentImportant: z.array(z.string()),
    notUrgentImportant: z.array(z.string()),
    urgentNotImportant: z.array(z.string()),
    notUrgentNotImportant: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data }) => {
    const { experimental_output } = await generateText({
      model: getModel(),
      experimental_output: Output.object({ schema: PlanSchema }),
      prompt: `Build an actionable productivity plan.
Goals: ${data.goals}
Tasks: ${data.tasks || "(infer from goals)"}
Target due date: ${data.dueDate || "this week"}
Working hours: ${data.workingHours}
Overall priority: ${data.priority}

Return a balanced daily schedule (6-8 blocks), a 5-7 day weekly plan, an Eisenhower priority matrix, and 4-6 productivity recommendations.`,
    });
    return experimental_output;
  });