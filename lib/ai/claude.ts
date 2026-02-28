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

const LEARNING_PATH_PROMPT = `You are an expert learning path architect who creates personalized, structured learning roadmaps across all domains of human knowledge. Your goal is to transform a user's learning goal into a comprehensive, actionable learning path with clear progression, high-quality resources, and realistic time estimates.

Here is the learning goal the user wants to achieve:

<learning_goal>
{{LEARNING_GOAL}}
</learning_goal>

Here is additional context about the user and their learning preferences:

<user_context>
{{USER_CONTEXT}}
</user_context>

Your task is to generate a complete learning path that will guide the user from their current level to achieving their learning goal. Follow these guidelines:

## Path Structure Requirements

1. **Number of Nodes**: Create 8-15 learning nodes (topics/concepts) that represent the key milestones in the learning journey. Fewer nodes for narrow topics, more for comprehensive subjects.

2. **Node Dependencies**: Establish clear prerequisite relationships between nodes. A node can have 0-3 prerequisites. Ensure the dependency graph is logical and creates a clear learning progression without circular dependencies.

3. **Progressive Difficulty**: Arrange nodes so that foundational concepts come first, with complexity increasing as the learner progresses.

4. **Category-Specific Pedagogy**: Adapt your approach based on the learning domain:
   - **Music/Arts**: Emphasize practice routines, technique building, and creative exercises
   - **Technology/Science**: Focus on hands-on projects, problem-solving, and building understanding through application
   - **Languages**: Balance grammar, vocabulary, listening, speaking, reading, and writing
   - **Personal Development**: Include reflection exercises, habit formation, and practical application
   - **Business**: Emphasize case studies, real-world application, and actionable frameworks
   - **Crafts/Hobbies**: Focus on technique mastery through progressive projects
   - **Health/Fitness**: Include progressive training plans with proper form and safety

## Node Content Requirements

For each learning node, provide:

1. **Title**: Clear, descriptive name (3-8 words)

2. **Description**: 2-3 sentences explaining what the learner will master and why it's important (100-150 words)

3. **Estimated Hours**: Realistic time estimate for completing this node (consider practice time, not just content consumption)

4. **Resources**: Provide 3-5 high-quality, diverse resources:
   - Include a mix of resource types: courses, videos, books, articles, apps, podcasts, interactive tools, communities, templates, etc.
   - Prioritize free or affordable options when possible
   - Include specific titles, creators/authors, and platforms
   - Ensure resources are reputable and well-regarded in their field
   - For each resource, specify: title, type, creator/platform, URL (if applicable), and a brief description
   - **USE WEB SEARCH** to find current, accurate URLs and verify resource availability

5. **Key Takeaways**: 3-5 specific skills or concepts the learner will gain (bullet points)

6. **Practical Exercises**: 2-4 hands-on activities or projects to reinforce learning

7. **Prerequisites**: List the IDs of nodes that should be completed before this one (use node IDs like "node-1", "node-2", etc.)

## Quality Standards

- **Personalization**: Tailor the path to the user's stated experience level, goals, and time commitment
- **Actionability**: Every node should have clear, concrete actions the learner can take
- **Motivation**: Include early wins and engaging content to maintain momentum
- **Comprehensiveness**: Cover all essential aspects of the topic without overwhelming the learner
- **Resource Quality**: Only recommend resources that are current, accurate, and highly-rated
- **Realistic Pacing**: Time estimates should account for practice, review, and mastery, not just content consumption

## Output Format

Provide your response as a valid JSON object with the following structure:

\`\`\`json
{
  "title": "Clear, engaging title for the learning path",
  "description": "2-3 sentence overview of what the learner will achieve",
  "estimatedDuration": 120,
  "difficultyLevel": "beginner|intermediate|advanced",
  "nodes": [
    {
      "id": "node-1",
      "title": "Node title",
      "description": "Detailed description",
      "nodeType": "concept|skill|project|milestone|practice|theory|technique|performance|foundation|integration",
      "difficulty": 3,
      "estimatedHours": 10,
      "prerequisites": [],
      "resources": [
        {
          "title": "Resource title",
          "resourceType": "course|video|book|article|app|podcast|documentation|exercise|community|tool",
          "platform": "Creator or platform name",
          "url": "https://example.com",
          "isFree": true,
          "description": "Brief description of the resource"
        }
      ],
      "keyTakeaways": [
        "Specific skill or concept learned"
      ],
      "practicalExercises": [
        "Hands-on activity or project"
      ]
    }
  ],
  "edges": [
    {"from": "node-1", "to": "node-2", "type": "prerequisite"}
  ],
  "milestones": [
    {"afterNode": "node-5", "description": "You can now build X"}
  ]
}
\`\`\`

## Important Notes

- Ensure all JSON is properly formatted and valid
- Use consistent node IDs (node-1, node-2, etc.) and reference them correctly in prerequisites
- The first node(s) should have empty prerequisites arrays
- Make sure the dependency graph is acyclic (no circular dependencies)
- Tailor resource recommendations to the user's stated preferences when provided
- If the user mentions specific constraints (budget, time, learning style), honor them in your recommendations
- **Use web search to find real, current URLs for resources**

Generate the complete learning path now, ensuring it is comprehensive, actionable, and perfectly suited to help the user achieve their learning goal.`;

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

    // Use beta API with web search for finding current resources
    const message = await anthropic.beta.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      temperature: 1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      tools: [
        {
          name: 'web_search',
          type: 'web_search_20250305',
        },
      ],
      betas: ['web-search-2025-03-05'],
    });

    // Extract text content from the response (may include web search results)
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
