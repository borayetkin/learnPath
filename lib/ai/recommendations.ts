import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface UserLearningProfile {
  userId: string;
  completedPaths: Array<{
    title: string;
    topic: string;
    categoryId: string | null;
    difficultyLevel: string | null;
  }>;
  inProgressPaths: Array<{
    title: string;
    topic: string;
    categoryId: string | null;
  }>;
  categoryPreferences: string[]; // Most active categories
}

interface AvailablePath {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  categoryId: string | null;
  difficultyLevel: string | null;
  viewCount: number;
  completionRate: number;
}

interface RecommendationResult {
  pathId: string;
  reason: string;
  score: number;
}

export async function generatePathRecommendations(
  profile: UserLearningProfile,
  availablePaths: AvailablePath[],
  limit: number = 5
): Promise<RecommendationResult[]> {
  try {
    const prompt = `You are an intelligent learning recommendation system. Analyze the user's learning history and suggest relevant learning paths.

User Learning Profile:
- Completed Paths: ${profile.completedPaths.map(p => `"${p.title}" (${p.topic})`).join(', ') || 'None'}
- In Progress: ${profile.inProgressPaths.map(p => `"${p.title}" (${p.topic})`).join(', ') || 'None'}
- Category Interests: ${profile.categoryPreferences.join(', ') || 'All'}

Available Paths to Recommend:
${availablePaths.slice(0, 20).map((path, i) =>
  `${i + 1}. ID: ${path.id}, Title: "${path.title}", Topic: ${path.topic}, Difficulty: ${path.difficultyLevel || 'N/A'}, Popularity: ${path.viewCount} views, ${path.completionRate}% completion rate`
).join('\n')}

Task: Select the top ${limit} most relevant learning paths for this user and explain why each would be valuable.

Consider:
1. Logical progression from completed/in-progress topics
2. Complementary skills and knowledge
3. Appropriate difficulty level (gradual progression)
4. Category diversity (explore related interests)
5. High-quality paths (popularity and completion rate)

Return JSON array with exactly ${limit} recommendations:
[
  {
    "pathId": "uuid-of-recommended-path",
    "reason": "Clear explanation why this path is recommended",
    "score": 0.95
  }
]

The score should be 0.0-1.0 representing recommendation confidence.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Use Haiku for cost efficiency
      max_tokens: 2048,
      temperature: 0.7,
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

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const recommendations: RecommendationResult[] = JSON.parse(jsonText);

    // Validate recommendations
    const validRecommendations = recommendations.filter(rec =>
      rec.pathId &&
      rec.reason &&
      typeof rec.score === 'number' &&
      availablePaths.some(p => p.id === rec.pathId)
    );

    return validRecommendations.slice(0, limit);
  } catch (error) {
    console.error('Error generating recommendations:', error);

    // Fallback: Return popular paths in user's preferred categories
    return availablePaths
      .filter(path =>
        !profile.completedPaths.some(cp => cp.title === path.title) &&
        !profile.inProgressPaths.some(ip => ip.title === path.title)
      )
      .sort((a, b) => {
        // Prioritize user's preferred categories
        const aInPreferred = profile.categoryPreferences.includes(a.categoryId || '');
        const bInPreferred = profile.categoryPreferences.includes(b.categoryId || '');

        if (aInPreferred && !bInPreferred) return -1;
        if (!aInPreferred && bInPreferred) return 1;

        // Then sort by popularity
        return (b.viewCount + b.completionRate * 10) - (a.viewCount + a.completionRate * 10);
      })
      .slice(0, limit)
      .map(path => ({
        pathId: path.id,
        reason: profile.categoryPreferences.includes(path.categoryId || '')
          ? `Popular in your interest area: ${path.topic}`
          : `Highly rated path: ${path.title}`,
        score: Math.min(0.9, (path.completionRate / 100 + path.viewCount / 1000)),
      }));
  }
}

export async function generateGroupRecommendations(
  userId: string,
  userCategories: string[],
  availableGroups: Array<{
    id: string;
    name: string;
    description: string | null;
    categoryId: string | null;
    memberCount: number;
  }>,
  limit: number = 5
): Promise<Array<{ groupId: string; reason: string; score: number }>> {
  // Simple algorithm: Match user's category interests with group categories
  return availableGroups
    .filter(group => userCategories.includes(group.categoryId || ''))
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, limit)
    .map(group => ({
      groupId: group.id,
      reason: `Active learning community with ${group.memberCount} members`,
      score: Math.min(0.95, 0.5 + (group.memberCount / 100)),
    }));
}
