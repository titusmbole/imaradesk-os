import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'

export default function SurveySubmit({
  survey = {},
  invitation = {},
  expired = false,
  already_completed = false,
  error = null,
}) {
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [thankYouMessage, setThankYouMessage] = useState('')
  
  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }
  
  const handleMultiSelect = (questionId, value, checked) => {
    setAnswers(prev => {
      const current = prev[questionId] || []
      if (checked) {
        return { ...prev, [questionId]: [...current, value] }
      } else {
        return { ...prev, [questionId]: current.filter(v => v !== value) }
      }
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    
    // Validate required fields
    const missingRequired = survey.questions?.filter(q => q.is_required && !answers[q.id])
    if (missingRequired?.length > 0) {
      setSubmitError('Please answer all required questions.')
      setSubmitting(false)
      return
    }
    
    try {
      const response = await fetch(`/api/survey/${invitation.token}/submit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
        setThankYouMessage(data.message || survey.thank_you_message)
      } else {
        setSubmitError(data.error || 'Failed to submit survey')
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  
  // Error states
  if (expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Expired</h1>
          <p className="text-gray-600">{error || 'This survey link has expired and is no longer available.'}</p>
        </div>
      </div>
    )
  }
  
  if (already_completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Completed</h1>
          <p className="text-gray-600">{error || 'You have already completed this survey. Thank you for your feedback!'}</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }
  
  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">{thankYouMessage}</p>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Head title={survey.name || 'Survey'} />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="bg-[#4a154b] text-white rounded-t-lg p-8">
            <h1 className="text-2xl font-bold mb-2">{survey.name}</h1>
            {survey.description && (
              <p className="text-white/80">{survey.description}</p>
            )}
            {invitation.ticket_number && (
              <p className="text-white/60 text-sm mt-4">
                Regarding ticket: #{invitation.ticket_number}
              </p>
            )}
          </div>
          
          {/* Form */}
          <div className="bg-white rounded-b-lg shadow-md">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {submitError && (
                <div className="p-4 bg-red-50 text-red-700 text-sm">
                  {submitError}
                </div>
              )}
              
              {survey.questions?.map((question, index) => (
                <div key={question.id} className="p-6">
                  <label className="block">
                    <span className="text-sm text-gray-500 mb-1 block">Question {index + 1}</span>
                    <span className="text-lg font-medium text-gray-900">
                      {question.question_text}
                      {question.is_required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </label>
                  
                  <div className="mt-4">
                    {/* Rating Question */}
                    {question.question_type === 'rating' && (
                      <div className="flex gap-2 flex-wrap">
                        {Array.from({ length: question.rating_scale }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleInputChange(question.id, num)}
                            className={`w-12 h-12 rounded-lg border-2 text-lg font-medium transition-all ${
                              answers[question.id] === num
                                ? 'border-[#4a154b] bg-[#4a154b] text-white'
                                : 'border-gray-300 hover:border-[#4a154b] text-gray-700'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* NPS Question (0-10) */}
                    {question.question_type === 'nps' && (
                      <div>
                        <div className="flex gap-1 flex-wrap">
                          {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleInputChange(question.id, num)}
                              className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all ${
                                answers[question.id] === num
                                  ? 'border-[#4a154b] bg-[#4a154b] text-white'
                                  : 'border-gray-300 hover:border-[#4a154b] text-gray-700'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                          <span>Not at all likely</span>
                          <span>Extremely likely</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Single Choice Question */}
                    {question.question_type === 'single_choice' && (
                      <div className="space-y-2">
                        {question.choices?.map((choice) => (
                          <label
                            key={choice.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[question.id] === choice.value
                                ? 'border-[#4a154b] bg-[#4a154b]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={choice.value}
                              checked={answers[question.id] === choice.value}
                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                              className="w-5 h-5 text-[#4a154b]"
                            />
                            <span className="text-gray-700">{choice.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {/* Multiple Choice Question */}
                    {question.question_type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {question.choices?.map((choice) => (
                          <label
                            key={choice.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              (answers[question.id] || []).includes(choice.value)
                                ? 'border-[#4a154b] bg-[#4a154b]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              value={choice.value}
                              checked={(answers[question.id] || []).includes(choice.value)}
                              onChange={(e) => handleMultiSelect(question.id, choice.value, e.target.checked)}
                              className="w-5 h-5 text-[#4a154b] rounded"
                            />
                            <span className="text-gray-700">{choice.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {/* Yes/No Question */}
                    {question.question_type === 'yes_no' && (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleInputChange(question.id, true)}
                          className={`flex-1 py-4 rounded-lg border-2 font-medium transition-all ${
                            answers[question.id] === true
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          ✓ Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange(question.id, false)}
                          className={`flex-1 py-4 rounded-lg border-2 font-medium transition-all ${
                            answers[question.id] === false
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-gray-400 text-gray-700'
                          }`}
                        >
                          ✗ No
                        </button>
                      </div>
                    )}
                    
                    {/* Text Question */}
                    {question.question_type === 'text' && (
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder={question.placeholder_text || 'Enter your response...'}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
              ))}
              
              {/* Submit Button */}
              <div className="p-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#4a154b] text-white font-medium rounded-lg hover:bg-[#5a235c] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Survey'}
                </button>
                {survey.is_anonymous && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    🔒 Your response will be submitted anonymously
                  </p>
                )}
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-6">
            Powered by ImaraDesk
          </div>
        </div>
      </div>
    </>
  )
}
