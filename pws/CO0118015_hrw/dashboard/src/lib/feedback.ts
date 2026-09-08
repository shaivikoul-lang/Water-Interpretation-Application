import { getSupabase } from './supabase'

export const QUESTION_ANSWERED = ['Yes', 'Partly', 'No'] as const
export const NEXT_STEPS = ['Yes', 'Somewhat', 'No', 'No action needed'] as const

export type QuestionAnswered = (typeof QUESTION_ANSWERED)[number]
export type NextStep = (typeof NEXT_STEPS)[number]

export type FeedbackInput = {
  questionAnswered: QuestionAnswered | null
  easeRating: number | null
  nextStep: NextStep | null
  comment: string
}

const COMMENT_MAX = 1000

export function isQuestionAnswered(value: string): value is QuestionAnswered {
  return (QUESTION_ANSWERED as readonly string[]).includes(value)
}

export function isNextStep(value: string): value is NextStep {
  return (NEXT_STEPS as readonly string[]).includes(value)
}

export function validateFeedback(input: FeedbackInput):
  | { ok: true; row: FeedbackRow }
  | { ok: false; message: string } {
  if (!input.questionAnswered || !isQuestionAnswered(input.questionAnswered)) {
    return { ok: false, message: 'Please choose Yes, Partly, or No before sending feedback.' }
  }

  if (input.easeRating !== null && (input.easeRating < 1 || input.easeRating > 5 || !Number.isInteger(input.easeRating))) {
    return { ok: false, message: 'Ease rating must be a whole number from 1 to 5.' }
  }

  if (input.nextStep !== null && !isNextStep(input.nextStep)) {
    return { ok: false, message: 'Please choose a valid next-step option.' }
  }

  const comment = input.comment.trim()
  if (comment.length > COMMENT_MAX) {
    return { ok: false, message: `Comments can be at most ${COMMENT_MAX} characters.` }
  }

  return {
    ok: true,
    row: {
      page: 'home',
      flow: 'homepage_feedback',
      question_answered: input.questionAnswered,
      ease_rating: input.easeRating,
      next_step: input.nextStep,
      comment: comment.length > 0 ? comment : null,
    },
  }
}

export type FeedbackRow = {
  page: 'home'
  flow: 'homepage_feedback'
  question_answered: QuestionAnswered
  ease_rating: number | null
  next_step: NextStep | null
  comment: string | null
}

export async function submitHomepageFeedback(
  input: FeedbackInput,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = validateFeedback(input)
  if (!parsed.ok) return parsed

  const supabase = getSupabase()
  if (!supabase) {
    return {
      ok: false,
      message: 'Feedback isn’t available right now. Please try again in a moment.',
    }
  }

  const { error } = await supabase.from('waterlens_feedback').insert(parsed.row)
  if (error) {
    const missingTable =
      error.code === 'PGRST205' || /could not find the table/i.test(error.message)
    return {
      ok: false,
      message: missingTable
        ? 'The feedback table isn’t created yet. In Supabase, open SQL Editor, run supabase/schema.sql, then send again.'
        : 'Feedback isn’t available right now. Please try again in a moment.',
    }
  }

  return { ok: true }
}
