import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  NEXT_STEPS,
  QUESTION_ANSWERED,
  submitHomepageFeedback,
  type NextStep,
  type QuestionAnswered,
} from '../../lib/feedback'

const COMMENT_MAX = 1000
const EASE_VALUES = [1, 2, 3, 4, 5] as const

export function ResidentFeedback({ compact = false }: { compact?: boolean }) {
  const formId = useId()
  const confirmRef = useRef<HTMLHeadingElement>(null)
  const [questionAnswered, setQuestionAnswered] = useState<QuestionAnswered | null>(null)
  const [easeRating, setEaseRating] = useState<number | null>(null)
  const [nextStep, setNextStep] = useState<NextStep | null>(null)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [revealDetails, setRevealDetails] = useState(false)

  const detailsOpen = questionAnswered !== null
  const remaining = COMMENT_MAX - comment.length

  useEffect(() => {
    if (!detailsOpen) {
      setRevealDetails(false)
      return
    }
    const frame = window.requestAnimationFrame(() => setRevealDetails(true))
    return () => window.cancelAnimationFrame(frame)
  }, [detailsOpen])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setMessage('')

    const result = await submitHomepageFeedback({
      questionAnswered,
      easeRating,
      nextStep,
      comment,
    })

    if (result.ok) {
      setStatus('success')
      setMessage('Thanks — your feedback will help improve WaterLens.')
      window.requestAnimationFrame(() => confirmRef.current?.focus())
      return
    }

    setStatus('error')
    setMessage(result.message)
  }

  const body: ReactNode =
    status === 'success' ? (
      <div className="feedback__confirm" role="status" aria-live="polite">
        <h2 id={`${formId}-title`} ref={confirmRef} className="feedback__title" tabIndex={-1}>
          Help improve WaterLens
        </h2>
        <p className="feedback__thanks">{message}</p>
      </div>
    ) : (
      <form className="feedback__form" onSubmit={handleSubmit} noValidate>
        <h2 id={`${formId}-title`} className="feedback__title">
          Help improve WaterLens
        </h2>
        <p className="feedback__lede">
          Your feedback helps make WaterLens clearer and more useful for residents.
        </p>

        <fieldset className="feedback__fieldset">
          <legend className="feedback__legend">
            Did WaterLens help answer the question you came with?
          </legend>
          <div className="feedback__choices">
            {QUESTION_ANSWERED.map((option) => (
              <label key={option} className="feedback__choice">
                <input
                  type="radio"
                  name={`${formId}-answered`}
                  value={option}
                  checked={questionAnswered === option}
                  onChange={() => {
                    setQuestionAnswered(option)
                    if (status === 'error') {
                      setStatus('idle')
                      setMessage('')
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div
          className={revealDetails ? 'feedback__details is-open' : 'feedback__details'}
          hidden={!detailsOpen}
        >
          <div className="feedback__details-inner">
            <fieldset className="feedback__fieldset">
              <legend className="feedback__legend">How easy was WaterLens to understand?</legend>
              <div className="feedback__scale">
                <span className="feedback__scale-label" id={`${formId}-hard`}>
                  Very difficult
                </span>
                <div
                  className="feedback__choices feedback__choices--scale"
                  aria-describedby={`${formId}-hard ${formId}-easy`}
                >
                  {EASE_VALUES.map((value) => (
                    <label key={value} className="feedback__choice feedback__choice--scale">
                      <input
                        type="radio"
                        name={`${formId}-ease`}
                        value={value}
                        checked={easeRating === value}
                        onChange={() => setEaseRating(value)}
                        aria-label={
                          value === 1
                            ? '1, Very difficult'
                            : value === 5
                              ? '5, Very easy'
                              : String(value)
                        }
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
                <span className="feedback__scale-label" id={`${formId}-easy`}>
                  Very easy
                </span>
              </div>
            </fieldset>

            <fieldset className="feedback__fieldset">
              <legend className="feedback__legend">Do you know what to do next?</legend>
              <div className="feedback__choices feedback__choices--wrap">
                {NEXT_STEPS.map((option) => (
                  <label key={option} className="feedback__choice">
                    <input
                      type="radio"
                      name={`${formId}-next`}
                      value={option}
                      checked={nextStep === option}
                      onChange={() => setNextStep(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="feedback__fieldset">
              <label className="feedback__legend" htmlFor={`${formId}-comment`}>
                What was still unclear or missing?
              </label>
              <textarea
                id={`${formId}-comment`}
                className="feedback__textarea"
                value={comment}
                maxLength={COMMENT_MAX}
                rows={4}
                onChange={(event) => setComment(event.target.value.slice(0, COMMENT_MAX))}
              />
              <p className="feedback__count" aria-live="polite">
                {remaining} characters left
              </p>
            </div>

            <p className="feedback__privacy">
              Please don’t include personal, medical, or identifying information.
            </p>

            <button type="submit" className="feedback__submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending feedback…' : 'Send feedback'}
            </button>
          </div>
        </div>

        <div className="feedback__status" role="status" aria-live="polite">
          {status === 'error' ? <p className="feedback__error">{message}</p> : null}
        </div>
      </form>
    )

  return (
    <section
      className={compact ? 'feedback feedback--embed' : 'feedback'}
      aria-labelledby={`${formId}-title`}
    >
      {compact ? body : (
        <div className="landing-container">
          <div className="feedback__card">{body}</div>
        </div>
      )}
    </section>
  )
}
