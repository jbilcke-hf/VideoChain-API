import { Video, VideoShot } from "../types.mts"

export const mockShots: VideoShot[] = [
  {
    "shotPrompt": "In the extreme wide shot, a flock of ducks is converging on the Central Park, coming from multiple directions. Their feathers are glossy and clean, casting off varying degrees of green, brown and white",
    "environmentPrompt": "Central Park at sunrise, the park looks slightly misty, the sky is tinged with shades of pink and orange as the day breaks. There's dew on the grass, and the leaves on trees are rustling in the light breeze",
    "photographyPrompt": "Eye-level shot with a slight tilt in the camera, capturing the panorama of the park. There's natural lighting, sun just rising. The camera zooms out to capture the ducks entering the park. Shutter speed is slow to capture the movement of ducks",
    "actionPrompt": "Large groups of ducks waddle into the park from various directions, some fly in groups, landing on the pond with small splashes. Movement is slow, slightly sped up to depict the invasion",
    "foregroundAudioPrompt": "A symphony of soft quacking and rustling feathers",
  },
  {
    "shotPrompt": "In the medium shot, a group of ducks are by the pond, pecking at the ground and frolicking in the water. One male mallard is particularly captivating with its emerald green head and healthy body",
    "environmentPrompt": "It's a sunny spring day in Central Park. The pond is surrounded by lush, green vegetation and dappled with sunlight filtering through the leaves",
    "photographyPrompt": "Low angle shot near the water level, the camera moves in a crane shot to capture ducks in action, and the camera's aperture is partially open. Natural sunlight creates playful shadows",
    "actionPrompt": "Ducks are pecking at the ground, dabbling at the water's edge and frolicking in the pond. The camera tracks a particularly majestic mallard navigating through the pond",
    "foregroundAudioPrompt": "Sounds of ducks quacking and splashing in the water"
  },
  {
    "shotPrompt": "Close-up shot of a mother duck with ducklings following her in a line on the grass and into the water",
    "environmentPrompt": "Central Park, by one of the smaller ponds, surrounded by green trees. Sun is high up giving off warm, radiant light",
    "photographyPrompt": "High angle shot, focusing on the line of ducklings following their mother. The camera follows the ducklings. The setting is bright and clear with sun illuminating the ducklings",
    "actionPrompt": "Mother duck is leading her ducklings from the grass into the water, the ducklings obediently follow, creating a neat line. The whole scene feels peaceful",
    "foregroundAudioPrompt": "Ducklings' high pitched chirping, soft lapping of water at the edge of the pond"
  }
] as any

export const mock: Video = {
  "backgroundAudioPrompt": "City ambience mixed with the rustling leaves and the chirping birds in the park",
  "foregroundAudioPrompt": "Rustling feathers, soft quacking, flapping wings, occasional splash in the pond",
  "actorPrompt": "Main actors are ducks - a variety of breeds, mostly mallards: males with glossy green heads and females in mottled brown; all plump, medium-sized waterfowl",
  "actorVoicePrompt": "Soft, low pitched quacking of adult ducks and higher pitched chirping of ducklings",
  "noise": true,
  "noiseAmount": 2,
  "outroDurationMs": 1500,
  "shots": mockShots
} as any