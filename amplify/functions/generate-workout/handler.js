import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
function buildPrompt(inputs) {
    const birthYear = new Date(inputs.birthday).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    const goalGuidance = inputs.goal === 'Bulking'
        ? 'muscle hypertrophy: prioritize 3-5 sets of 6-12 reps with heavier compound lifts, 60-90s rest'
        : inputs.goal === 'Cutting'
            ? 'fat loss while preserving muscle: 3-4 sets of 12-20 reps, shorter 30-60s rest, superset where possible'
            : 'maintenance and general fitness: balanced 3-4 sets of 8-15 reps, 60s rest';
    return `You are an expert personal trainer and strength & conditioning specialist. Create a detailed, effective, and safe workout plan based on this client profile:

CLIENT PROFILE:
- Age: ${age} years old
- Gender: ${inputs.gender}
- Height: ${inputs.height}
- Weight: ${inputs.weight}
- Training style: ${inputs.workoutType}
- Experience level: ${inputs.intensity}
- Primary goal: ${inputs.goal}
- Target muscles: ${inputs.targetMuscles.join(', ')}
- Session length: ${inputs.duration} minutes

PROGRAMMING RULES:
- Optimise for ${goalGuidance}
- Order exercises: compound lifts first, isolation movements last
- Tempo format is eccentric-pause-concentric (e.g. "3-1-2" = 3s lower, 1s pause, 2s lift; "X" means explosive)
- Include rest time and one key coaching cue in every note
- Scale volume so the session realistically fits ${inputs.duration} minutes
- For ${inputs.intensity} trainees: ${inputs.intensity === 'Beginner'
        ? 'keep technique simple, choose accessible equipment, avoid failure'
        : inputs.intensity === 'Intermediate'
            ? 'push close to failure on last set, include some variation'
            : 'include advanced techniques like drop sets or pauses where appropriate'}

Return ONLY a valid JSON object — no markdown, no explanation, just raw JSON:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": "4",
      "reps": "8-10",
      "tempo": "3-1-2",
      "note": "Rest 90s. Drive through heels and keep chest tall."
    }
  ]
}`;
}
export const handler = async (event) => {
    const inputs = JSON.parse(event.arguments.inputs);
    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: 'You are an expert personal trainer. Always respond with valid JSON only — no markdown fences, no preamble, just the raw JSON object.',
            },
            {
                role: 'user',
                content: buildPrompt(inputs),
            },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2048,
    });
    return completion.choices[0].message.content;
};
