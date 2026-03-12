import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import SurveySidebar from '../components/SurveySidebar'
import Select from '../components/SearchableSelect'
import Modal, { ModalBody, ModalFooter } from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { THEME } from '../constants/theme'
import { Star, Circle, CheckSquare, Type, ToggleLeft, BarChart3, ArrowLeft, Plus, HelpCircle, Eye, Edit, Trash2, X, Check } from 'lucide-react'

const questionTypeIcons = {
  rating: Star,
  single_choice: Circle,
  multiple_choice: CheckSquare,
  text: Type,
  yes_no: ToggleLeft,
  nps: BarChart3,
}

export default function SurveyForm({
  survey = null,
  departments = [],
  surveyTypes = [],
  triggerEvents = [],
  questionTypes = [],
  sidebar = { views: [] },
}) {
  const isEditing = !!survey
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState({
    name: survey?.name || '',
    description: survey?.description || '',
    survey_type: survey?.survey_type || 'csat',
    trigger_event: survey?.trigger_event || 'resolved',
    send_delay: survey?.send_delay || 30,
    expiry_days: survey?.expiry_days || 7,
    is_active: survey?.is_active ?? true,
    is_default: survey?.is_default || false,
    allow_multiple_responses: survey?.allow_multiple_responses || false,
    is_anonymous: survey?.is_anonymous || false,
    thank_you_message: survey?.thank_you_message || 'Thank you for your feedback! Your response helps us improve our service.',
  })
  
  const [questions, setQuestions] = useState(survey?.questions || [])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Question Modal State
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [previewQuestion, setPreviewQuestion] = useState(null)
  const [deleteQuestionIndex, setDeleteQuestionIndex] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'rating',
    is_required: true,
    rating_scale: 5,
    placeholder_text: '',
    choices: [],
  })
  
  const resetQuestionForm = () => {
    setCurrentQuestion({
      question_text: '',
      question_type: 'rating',
      is_required: true,
      rating_scale: 5,
      placeholder_text: '',
      choices: [],
    })
    setEditingQuestionIndex(null)
  }
  
  const openAddQuestionModal = () => {
    resetQuestionForm()
    setQuestionModalOpen(true)
  }
  
  const openEditQuestionModal = (index) => {
    setCurrentQuestion({ ...questions[index] })
    setEditingQuestionIndex(index)
    setQuestionModalOpen(true)
  }
  
  const closeQuestionModal = () => {
    setQuestionModalOpen(false)
    resetQuestionForm()
  }
  
  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }))
  }
  
  const addChoiceToModal = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      choices: [...(prev.choices || []), { label: '', value: '', is_other: false, order: (prev.choices || []).length }]
    }))
  }
  
  const updateChoiceInModal = (choiceIndex, updates) => {
    setCurrentQuestion(prev => ({
      ...prev,
      choices: prev.choices.map((c, ci) => ci === choiceIndex ? { ...c, ...updates } : c)
    }))
  }
  
  const removeChoiceFromModal = (choiceIndex) => {
    setCurrentQuestion(prev => ({
      ...prev,
      choices: prev.choices.filter((_, ci) => ci !== choiceIndex)
    }))
  }
  
  const saveQuestion = (andAddNext = false) => {
    if (!currentQuestion.question_text.trim()) {
      toast.error('Please enter a question text')
      return
    }
    
    if (['single_choice', 'multiple_choice'].includes(currentQuestion.question_type) && 
        (!currentQuestion.choices || currentQuestion.choices.length === 0)) {
      toast.error('Please add at least one choice')
      return
    }
    
    if (editingQuestionIndex !== null) {
      // Update existing question
      setQuestions(prev => prev.map((q, i) => 
        i === editingQuestionIndex ? { ...currentQuestion, order: i } : q
      ))
      toast.success('Question updated')
    } else {
      // Add new question
      setQuestions(prev => [...prev, { ...currentQuestion, id: null, order: prev.length }])
      toast.success('Question added')
    }
    
    if (andAddNext) {
      resetQuestionForm()
    } else {
      closeQuestionModal()
    }
  }
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const addQuestion = () => {
    openAddQuestionModal()
  }
  
  const updateQuestion = (index, updates) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...updates } : q))
  }
  
  const removeQuestion = (index) => {
    setDeleteQuestionIndex(index)
  }
  
  const confirmDeleteQuestion = () => {
    if (deleteQuestionIndex !== null) {
      setQuestions(prev => prev.filter((_, i) => i !== deleteQuestionIndex).map((q, i) => ({ ...q, order: i })))
      toast.success('Question removed')
      setDeleteQuestionIndex(null)
    }
  }
  
  const moveQuestion = (index, direction) => {
    setQuestions(prev => {
      const newQuestions = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newQuestions.length) return prev
      ;[newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
      return newQuestions.map((q, i) => ({ ...q, order: i }))
    })
  }
  
  const addChoice = (questionIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q
      return {
        ...q,
        choices: [...(q.choices || []), { label: '', value: '', is_other: false, order: (q.choices || []).length }]
      }
    }))
  }
  
  const updateChoice = (questionIndex, choiceIndex, updates) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q
      return {
        ...q,
        choices: q.choices.map((c, ci) => ci === choiceIndex ? { ...c, ...updates } : c)
      }
    }))
  }
  
  const removeChoice = (questionIndex, choiceIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== questionIndex) return q
      return {
        ...q,
        choices: q.choices.filter((_, ci) => ci !== choiceIndex)
      }
    }))
  }
  
  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (currentStep === 1) {
      if (!formData.name) {
        toast.error('Please enter a survey name')
        return false
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (questions.length === 0) {
        toast.error('Please add at least one question')
        return false
      }
      const hasEmptyQuestion = questions.some(q => !q.question_text.trim())
      if (hasEmptyQuestion) {
        toast.error('Please fill in all question texts')
        return false
      }
      setCurrentStep(3)
    }
    return false
  }

  const handleBack = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
    return false
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    
    try {
      const payload = {
        ...formData,
        questions: questions.map((q, i) => ({
          ...q,
          order: i,
          choices: (q.choices || []).map((c, ci) => ({ ...c, order: ci }))
        }))
      }
      
      const url = isEditing ? `/api/surveys/${survey.id}/` : '/api/surveys/'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(isEditing ? 'Survey updated successfully!' : 'Survey created successfully!')
        router.visit(`/surveys/${data.survey.id}/`)
      } else {
        setErrors({ general: data.error || 'An error occurred' })
        toast.error(data.error || 'An error occurred')
      }
    } catch (error) {
      setErrors({ general: 'Failed to save survey' })
      toast.error('Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    { num: 1, title: 'Basic Info', description: 'Name, type & trigger' },
    { num: 2, title: 'Questions', description: 'Add survey questions' },
    { num: 3, title: 'Settings', description: 'Timing & behavior' },
  ]
  
  return (
    <>
      <Head title={isEditing ? `Edit Survey - ${survey.name}` : 'Create Survey'} />
      <AppShell active="surveys">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <SurveySidebar 
            views={sidebar.views} 
            currentView={isEditing ? 'edit' : 'create'} 
            activePage={isEditing ? 'edit' : 'create'} 
          />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <Link href="/surveys/" className="text-gray-500 hover:text-gray-700">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-semibold text-gray-800">
                  {isEditing ? 'Edit Survey' : 'Create New Survey'}
                </h1>
              </div>
            </div>

            <div className="flex gap-0">
              {/* Vertical Step Indicators */}
              <div className="w-64 flex-shrink-0 border-r border-gray-200 p-6">
                <div className="sticky top-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">Steps</h3>
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <React.Fragment key={step.num}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                            currentStep === step.num ? 'bg-gray-900 text-white' : 
                            currentStep > step.num ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                          </div>
                          <div className="flex-1 pt-1">
                            <h4 className={`text-sm font-medium ${
                              currentStep === step.num ? 'text-gray-900' : 
                              currentStep > step.num ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                          </div>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="flex items-center gap-3">
                            <div className="w-8 flex justify-center">
                              <div className={`w-0.5 h-8 ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 p-6">
                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 max-w-2xl">
                    {errors.general}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Survey Name* <span className="text-xs text-gray-500">(required)</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                          placeholder="e.g., Post-Resolution CSAT Survey"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                          placeholder="Describe the purpose of this survey..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Survey Type</label>
                        <Select
                          value={formData.survey_type}
                          onChange={(value) => setFormData(prev => ({ ...prev, survey_type: value }))}
                          options={surveyTypes}
                          displayKey="label"
                          valueKey="value"
                          placeholder="Select survey type"
                          allowClear={false}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Event</label>
                        <Select
                          value={formData.trigger_event}
                          onChange={(value) => setFormData(prev => ({ ...prev, trigger_event: value }))}
                          options={triggerEvents}
                          displayKey="label"
                          valueKey="value"
                          placeholder="Select trigger event"
                          allowClear={false}
                        />
                        <p className="text-xs text-gray-500 mt-1">When should this survey be sent?</p>
                      </div>
                    </>
                  )}

                  {/* Step 2: Questions */}
                  {currentStep === 2 && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">Survey Questions</h2>
                          <p className="text-sm text-gray-500">Add and configure your survey questions</p>
                        </div>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-[#4a154b] rounded-md hover:bg-[#5a235c]"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Question
                        </button>
                      </div>
                      
                      {questions.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-gray-200 border-dashed rounded-lg">
                          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">No questions added yet</p>
                          <p className="text-sm text-gray-400">Click "Add Question" to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {questions.map((question, qIndex) => (
                            <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="flex flex-col gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveQuestion(qIndex, 'up')}
                                    disabled={qIndex === 0}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  >
                                    ▲
                                  </button>
                                  <div className="w-8 h-8 bg-[#4a154b] text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    {qIndex + 1}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => moveQuestion(qIndex, 'down')}
                                    disabled={qIndex === questions.length - 1}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                  >
                                    ▼
                                  </button>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">
                                        {question.question_text || <span className="text-gray-400 italic">No question text</span>}
                                        {question.is_required && <span className="text-red-500 ml-1">*</span>}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                          {React.createElement(questionTypeIcons[question.question_type] || Star, { className: 'w-3 h-3' })}
                                          {questionTypes.find(t => t.value === question.question_type)?.label || question.question_type}
                                        </span>
                                        {question.question_type === 'rating' && (
                                          <span className="text-xs text-gray-500">Scale: 1-{question.rating_scale}</span>
                                        )}
                                        {['single_choice', 'multiple_choice'].includes(question.question_type) && question.choices?.length > 0 && (
                                          <span className="text-xs text-gray-500">{question.choices.length} choices</span>
                                        )}
                                      </div>
                                      {['single_choice', 'multiple_choice'].includes(question.question_type) && question.choices?.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {question.choices.slice(0, 4).map((choice, ci) => (
                                            <span key={ci} className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200">
                                              {choice.label || `Choice ${ci + 1}`}
                                            </span>
                                          ))}
                                          {question.choices.length > 4 && (
                                            <span className="text-xs text-gray-400">+{question.choices.length - 4} more</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setPreviewQuestion(question)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Preview question"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openEditQuestionModal(qIndex)}
                                        className="p-2 text-gray-500 hover:text-[#4a154b] hover:bg-gray-100 rounded-md transition-colors"
                                        title="Edit question"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Remove question"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Step 3: Settings */}
                  {currentStep === 3 && (
                    <>
                      <div className="mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Survey Settings</h2>
                        <p className="text-sm text-gray-500">Configure timing and behavior options</p>
                      </div>

                      <div className="space-y-6 bg-white border border-gray-200 rounded-lg p-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Send Delay (minutes)</label>
                            <input
                              type="number"
                              name="send_delay"
                              value={formData.send_delay}
                              onChange={handleInputChange}
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Time to wait before sending survey</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Link Expiry (days)</label>
                            <input
                              type="number"
                              name="expiry_days"
                              value={formData.expiry_days}
                              onChange={handleInputChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">How long the survey link remains valid</p>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-3">Options</label>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#4a154b] rounded focus:ring-[#4a154b]"
                              />
                              <div>
                                <span className="text-sm text-gray-700 font-medium">Active</span>
                                <p className="text-xs text-gray-500">Survey will be sent automatically when triggered</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#4a154b] rounded focus:ring-[#4a154b]"
                              />
                              <div>
                                <span className="text-sm text-gray-700 font-medium">Default for trigger event</span>
                                <p className="text-xs text-gray-500">Use as the default survey for this trigger</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                name="allow_multiple_responses"
                                checked={formData.allow_multiple_responses}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#4a154b] rounded focus:ring-[#4a154b]"
                              />
                              <div>
                                <span className="text-sm text-gray-700 font-medium">Allow multiple responses</span>
                                <p className="text-xs text-gray-500">Let customers submit the survey more than once</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                name="is_anonymous"
                                checked={formData.is_anonymous}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-[#4a154b] rounded focus:ring-[#4a154b]"
                              />
                              <div>
                                <span className="text-sm text-gray-700 font-medium">Anonymous responses</span>
                                <p className="text-xs text-gray-500">Do not link responses to customer profiles</p>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thank You Message</label>
                          <textarea
                            name="thank_you_message"
                            value={formData.thank_you_message}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Message shown after survey completion..."
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          className={`px-4 py-2 rounded-md ${THEME.button.secondary}`}
                        >
                          Back
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/surveys/"
                        className={`px-4 py-2 rounded-md ${THEME.button.secondary}`}
                      >
                        Cancel
                      </Link>
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className={`px-4 py-2 rounded-md ${THEME.button.primary}`}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={saving}
                          className={`px-4 py-2 rounded-md ${THEME.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Survey')}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
      
      {/* Question Modal */}
      <Modal
        isOpen={questionModalOpen}
        onClose={closeQuestionModal}
        title={editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
        maxWidth="max-w-2xl"
      >
        <ModalBody>
          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentQuestion.question_text}
                onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                placeholder="Enter your question..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
              />
            </div>
            
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
              <Select
                value={currentQuestion.question_type}
                onChange={(value) => handleQuestionChange('question_type', value)}
                options={questionTypes.map(t => ({ value: t.value, label: t.label }))}
                displayKey="label"
                valueKey="value"
                placeholder="Select type"
                allowClear={false}
              />
            </div>
            
            {/* Rating Scale - only for rating type */}
            {currentQuestion.question_type === 'rating' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Scale</label>
                <Select
                  value={currentQuestion.rating_scale}
                  onChange={(value) => handleQuestionChange('rating_scale', parseInt(value))}
                  options={[3, 4, 5, 7, 10].map(n => ({ value: n, label: `1-${n}` }))}
                  displayKey="label"
                  valueKey="value"
                  placeholder="Select scale"
                  allowClear={false}
                />
              </div>
            )}
            
            {/* Placeholder Text - only for text type */}
            {currentQuestion.question_type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder Text</label>
                <input
                  type="text"
                  value={currentQuestion.placeholder_text || ''}
                  onChange={(e) => handleQuestionChange('placeholder_text', e.target.value)}
                  placeholder="Enter placeholder text (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                />
              </div>
            )}
            
            {/* Choices - for single/multiple choice types */}
            {['single_choice', 'multiple_choice'].includes(currentQuestion.question_type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choices <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {(currentQuestion.choices || []).map((choice, cIndex) => (
                    <div key={cIndex} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={choice.label}
                        onChange={(e) => updateChoiceInModal(cIndex, { label: e.target.value, value: e.target.value })}
                        placeholder={`Choice ${cIndex + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-500">
                        <input
                          type="checkbox"
                          checked={choice.is_other}
                          onChange={(e) => updateChoiceInModal(cIndex, { is_other: e.target.checked })}
                          className="w-3 h-3 text-[#4a154b] rounded"
                        />
                        Other
                      </label>
                      <button
                        type="button"
                        onClick={() => removeChoiceFromModal(cIndex)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChoiceToModal}
                    className="inline-flex items-center text-sm text-[#4a154b] hover:text-[#5a235c] font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Choice
                  </button>
                </div>
              </div>
            )}
            
            {/* Required checkbox */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentQuestion.is_required}
                  onChange={(e) => handleQuestionChange('is_required', e.target.checked)}
                  className="w-4 h-4 text-[#4a154b] rounded focus:ring-[#4a154b]"
                />
                <span className="text-sm text-gray-700">Required question</span>
              </label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-between">
          <button
            type="button"
            onClick={closeQuestionModal}
            className={`px-4 py-2 rounded-md ${THEME.button.secondary}`}
          >
            Close
          </button>
          <div className="flex items-center gap-3">
            {editingQuestionIndex === null && (
              <button
                type="button"
                onClick={() => saveQuestion(true)}
                className="px-4 py-2 rounded-md border border-[#4a154b] text-[#4a154b] hover:bg-[#4a154b]/5 font-medium"
              >
                Create & Add Next
              </button>
            )}
            <button
              type="button"
              onClick={() => saveQuestion(false)}
              className={`px-4 py-2 rounded-md ${THEME.button.primary}`}
            >
              {editingQuestionIndex !== null ? 'Update' : 'Create'}
            </button>
          </div>
        </ModalFooter>
      </Modal>
      
      {/* Question Preview Modal */}
      <Modal
        isOpen={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        title="Question Preview"
        maxWidth="max-w-lg"
      >
        <ModalBody>
          {previewQuestion && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {previewQuestion.question_text}
                  {previewQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
                </p>
              </div>
              
              {/* Rating Preview */}
              {previewQuestion.question_type === 'rating' && (
                <div className="flex gap-2">
                  {Array.from({ length: previewQuestion.rating_scale || 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-[#4a154b] hover:bg-[#4a154b]/5 text-gray-600 hover:text-[#4a154b] font-medium transition-colors"
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Single Choice Preview */}
              {previewQuestion.question_type === 'single_choice' && (
                <div className="space-y-2">
                  {(previewQuestion.choices || []).map((choice, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#4a154b] cursor-pointer transition-colors">
                      <input type="radio" name="preview-single" className="w-4 h-4 text-[#4a154b]" />
                      <span className="text-sm text-gray-700">{choice.label || `Choice ${i + 1}`}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Multiple Choice Preview */}
              {previewQuestion.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {(previewQuestion.choices || []).map((choice, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#4a154b] cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 text-[#4a154b] rounded" />
                      <span className="text-sm text-gray-700">{choice.label || `Choice ${i + 1}`}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Text Preview */}
              {previewQuestion.question_type === 'text' && (
                <textarea
                  placeholder={previewQuestion.placeholder_text || 'Type your answer here...'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4a154b] focus:border-transparent resize-none"
                  rows={4}
                  readOnly
                />
              )}
              
              {/* Yes/No Preview */}
              {previewQuestion.question_type === 'yes_no' && (
                <div className="flex gap-3">
                  <button type="button" className="flex-1 py-3 px-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-700 font-medium transition-colors">
                    Yes
                  </button>
                  <button type="button" className="flex-1 py-3 px-4 bg-white rounded-lg border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-700 font-medium transition-colors">
                    No
                  </button>
                </div>
              )}
              
              {/* NPS Preview */}
              {previewQuestion.question_type === 'nps' && (
                <div>
                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 11 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`flex-1 py-2 rounded text-sm font-medium border transition-colors ${
                          i <= 6 ? 'border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600' :
                          i <= 8 ? 'border-yellow-200 hover:bg-yellow-50 hover:border-yellow-400 text-yellow-600' :
                          'border-green-200 hover:bg-green-50 hover:border-green-400 text-green-600'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Not at all likely</span>
                    <span>Extremely likely</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setPreviewQuestion(null)}
            className={`px-4 py-2 rounded-md ${THEME.button.primary}`}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
      
      {/* Delete Question Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteQuestionIndex !== null}
        onClose={() => setDeleteQuestionIndex(null)}
        onConfirm={confirmDeleteQuestion}
        title="Delete Question"
        message={`Are you sure you want to delete this question? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </>
  )
}
