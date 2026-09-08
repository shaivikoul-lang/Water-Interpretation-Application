/**
 * Screen 2 — guided observation picker.
 *
 * Cards either hand off to a taste clarify id or stay on a pending notice.
 * This file does not interpret water data.
 */

export const OBSERVATION_PENDING_MESSAGE =
  'This observation path is coming next. WaterLens will not guess a cause from how water looks or from scale in your home.'

export type ObservationIntent =
  | { kind: 'clarify'; clarifyId: string }
  | { kind: 'pending'; message: string }

export type ObservationChoice = {
  id: string
  title: string
  description: string
  intent: ObservationIntent
}

export const OBSERVATION_CHOICES: ObservationChoice[] = [
  {
    id: 'metallic',
    title: 'Metallic taste',
    description: 'Tastes like metal, iron, or pennies.',
    intent: { kind: 'clarify', clarifyId: 'metallic' },
  },
  {
    id: 'chlorine',
    title: 'Chlorine / chemical smell',
    description: 'Smells like chlorine or a swimming pool.',
    intent: { kind: 'clarify', clarifyId: 'chlorine' },
  },
  {
    id: 'cloudy',
    title: 'Cloudy / white appearance',
    description: 'Looks cloudy, milky, or white.',
    intent: { kind: 'clarify', clarifyId: 'cloudy' },
  },
  {
    id: 'musty',
    title: 'Earthy / musty smell',
    description: 'Smells earthy, musty, or like soil.',
    intent: { kind: 'clarify', clarifyId: 'musty' },
  },
  {
    id: 'discoloration',
    title: 'Discoloration',
    description: 'Yellow, brown, reddish, or unusual color.',
    intent: { kind: 'clarify', clarifyId: 'discoloration' },
  },
  {
    id: 'scale',
    title: 'Hard-water scale',
    description: 'White spots, mineral buildup, or scale.',
    intent: { kind: 'clarify', clarifyId: 'scale' },
  },
  {
    id: 'other',
    title: 'Something else',
    description: 'My concern does not match these options.',
    intent: { kind: 'clarify', clarifyId: 'unsure' },
  },
]
