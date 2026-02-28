import Anthropic from '@anthropic-ai/sdk';
import {
  PathGenerationRequest,
  AIPathGenerationResponse,
  AIPathGenerationResponseSchema,
} from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildLearningGoal(request: PathGenerationRequest): string {
  const {
    topic,
    categorySlug,
    learningGoal,
    currentKnowledge,
  } = request;

  let goal = `Learn ${topic}`;
  
  if (learningGoal) {
    goal += ` with the goal of: ${learningGoal}`;
  }
  
  if (categorySlug) {
    goal += ` (Category: ${categorySlug.replace('-', ' ')})`;
  }
  
  if (currentKnowledge && currentKnowledge.length > 0) {
    goal += `. Already familiar with: ${currentKnowledge.join(', ')}`;
  }
  
  return goal;
}

function buildUserContext(request: PathGenerationRequest): string {
  const {
    userBackground,
    learningGoal,
    timeCommitment,
    preferredResourceTypes,
    currentKnowledge,
  } = request;

  const contextParts = [];
  
  if (userBackground) {
    contextParts.push(`Background: ${userBackground}`);
  }
  
  if (learningGoal) {
    contextParts.push(`Primary Goal: ${learningGoal}`);
  }
  
  if (timeCommitment) {
    contextParts.push(`Time Commitment: ${timeCommitment}`);
  }
  
  if (preferredResourceTypes && preferredResourceTypes.length > 0) {
    contextParts.push(`Preferred Learning Formats: ${preferredResourceTypes.join(', ')}`);
  }
  
  if (currentKnowledge && currentKnowledge.length > 0) {
    contextParts.push(`Current Knowledge: ${currentKnowledge.join(', ')}`);
  }
  
  if (contextParts.length === 0) {
    return 'No additional context provided. Assume beginner level with flexible time commitment.';
  }
  
  return contextParts.join('\n');
}

const LEARNING_PATH_PROMPT = `Generate a learning path as JSON for this goal:

Goal: {{LEARNING_GOAL}}
Context: {{USER_CONTEXT}}

Create 6-10 nodes with progressive difficulty. Each node needs a title, description (1-2 sentences), resources (2-3 per node), key takeaways, and exercises.

Respond with ONLY valid JSON matching this structure:
{"title":"Path title","description":"Overview","estimatedDuration":40,"difficultyLevel":"beginner|intermediate|advanced","nodes":[{"id":"node-1","title":"Title","description":"What the learner will master","nodeType":"foundation|concept|skill|project|practice|theory|technique|performance|integration","difficulty":1,"estimatedHours":5,"prerequisites":[],"resources":[{"title":"Resource","resourceType":"course|video|book|article|app|podcast|documentation|exercise|community|tool","platform":"Platform","url":"https://example.com","isFree":true,"description":"Brief description"}],"keyTakeaways":["Skill learned"],"practicalExercises":["Exercise"]}],"edges":[{"from":"node-1","to":"node-2","type":"prerequisite"}],"milestones":[{"afterNode":"node-3","description":"Milestone reached"}]}`;

export async function generateLearningPath(
  request: PathGenerationRequest
): Promise<AIPathGenerationResponse> {
  try {
    const learningGoal = buildLearningGoal(request);
    const userContext = buildUserContext(request);
    
    // Build the prompt with actual values
    const prompt = LEARNING_PATH_PROMPT
      .replace('{{LEARNING_GOAL}}', learningGoal)
      .replace('{{USER_CONTEXT}}', userContext);

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      temperature: 1,
      system: 'You are a JSON API that generates learning paths. Respond with ONLY valid JSON, no markdown or explanation.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content from the response
    let jsonText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        jsonText += block.text;
      }
    }

    if (!jsonText) {
      throw new Error('No text content in AI response');
    }

    // Parse JSON from the response
    // Claude might wrap JSON in markdown code blocks, so we need to extract it
    jsonText = jsonText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Sometimes there's text before/after the JSON, try to extract just the JSON
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    // Replace simple node IDs (e.g. "node-1") with real UUIDs
    if (parsed.nodes && Array.isArray(parsed.nodes)) {
      const idMap = new Map<string, string>();
      for (const node of parsed.nodes) {
        if (node.id && !node.id.match(/^[0-9a-f]{8}-/)) {
          const uuid = crypto.randomUUID();
          idMap.set(node.id, uuid);
          node.id = uuid;
        }
      }
      // Update prerequisites and edges to use the new UUIDs
      for (const node of parsed.nodes) {
        if (node.prerequisites && Array.isArray(node.prerequisites)) {
          node.prerequisites = node.prerequisites.map(
            (p: string) => idMap.get(p) ?? p
          );
        }
      }
      if (parsed.edges && Array.isArray(parsed.edges)) {
        for (const edge of parsed.edges) {
          if (edge.from) edge.from = idMap.get(edge.from) ?? edge.from;
          if (edge.to) edge.to = idMap.get(edge.to) ?? edge.to;
          edge.type = 'prerequisite';
        }
      }
      if (parsed.milestones && Array.isArray(parsed.milestones)) {
        for (const m of parsed.milestones) {
          if (m.afterNode) m.afterNode = idMap.get(m.afterNode) ?? m.afterNode;
        }
      }
    }

    // Validate the response against our schema
    const validated = AIPathGenerationResponseSchema.parse(parsed);

    return validated;
  } catch (error) {
    console.error('Error generating learning path:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to generate learning path: ${error.message}`);
    }

    throw new Error('Failed to generate learning path: Unknown error');
  }
}

export async function enhanceResource(
  resourceUrl: string,
  context: string
): Promise<{
  isValid: boolean;
  qualityScore: number;
  summary?: string;
  alternativeUrls?: string[];
}> {
  try {
    const prompt = `Analyze this learning resource URL: ${resourceUrl}

Context: ${context}

Please provide:
1. Whether the URL appears valid and accessible
2. A quality score (0-1) based on the platform and resource type
3. A brief summary of what the resource offers
4. 2-3 alternative resource URLs if available

Return JSON:
{
  "isValid": true,
  "qualityScore": 0.85,
  "summary": "...",
  "alternativeUrls": ["url1", "url2"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Use faster model for resource enhancement
      max_tokens: 1024,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in AI response');
    }

    let jsonText = textContent.text.trim();

    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error enhancing resource:', error);

    // Return default values on error
    return {
      isValid: true,
      qualityScore: 0.5,
    };
  }
}
