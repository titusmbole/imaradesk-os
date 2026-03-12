import React, { useEffect, useState } from 'react'
import { Head, useForm, Link } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import Select from '../components/SearchableSelect'
import { THEME } from '../constants/theme'

export default function AddTask({ groups = [], users = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    assignee: '',
    priority: 'normal',
    group: '',
    tags: '[]',
    due_date: '',
    watchers: '[]',
  })

  const [tagInput, setTagInput] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedWatchers, setSelectedWatchers] = useState([])

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error))
    }
  }, [errors])

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      const newTags = [...selectedTags, tagInput.trim()]
      setSelectedTags(newTags)
      setData('tags', JSON.stringify(newTags))
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    const newTags = selectedTags.filter(t => t !== tag)
    setSelectedTags(newTags)
    setData('tags', JSON.stringify(newTags))
  }

  const toggleWatcher = (userId) => {
    const newWatchers = selectedWatchers.includes(userId)
      ? selectedWatchers.filter(id => id !== userId)
      : [...selectedWatchers, userId]
    setSelectedWatchers(newWatchers)
    setData('watchers', JSON.stringify(newWatchers))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!data.title || !data.description) {
      toast.error('Please fill in all required fields')
      return
    }

    toast.promise(
      new Promise((resolve, reject) => {
        post('/tasks/new/', data, {
          preserveScroll: true,
          onSuccess: () => resolve(),
          onError: () => reject(new Error('Failed to create task')),
        })
      }),
      {
        loading: 'Creating task...',
        success: 'Task created successfully!',
        error: (err) => err.message || 'Failed to create task',
      }
    )
  }

  return (
    <>
      <Head title="New Task" />
      <AppShell active="tasks">
        <main className="flex-1 bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
                <p className="text-sm text-gray-600 mt-1">Fill in the details below to create a task</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/tasks/"
                  className="px-6 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-[#4a154b] text-white rounded-md hover:bg-[#0a2f33] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="h-[calc(100vh-140px)]">
            <div className="grid grid-cols-[60%_40%] gap-6 p-6 h-full">
              {/* Left Section - Title & Description */}
              <div className="bg-white p-6 flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Information</h2>
                
                <div className="flex-1 flex flex-col gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={e => setData('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                      placeholder="Brief summary of the task"
                    />
                    {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  {/* Description */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={data.description}
                      onChange={e => setData('description', e.target.value)}
                      className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a154b] focus:border-transparent font-mono text-sm resize-none"
                      placeholder="Detailed description of the task..."
                    />
                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">Use Markdown formatting if needed</p>
                  </div>
                </div>
              </div>

              {/* Right Section - All Other Fields */}
              <div className="bg-white p-6 overflow-y-auto">
                
                <div className="space-y-6">
                  {/* Assignment */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignment</h3>
                    <div className="space-y-4">
                      {/* Assignee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assignee
                        </label>
                        <Select
                          value={data.assignee}
                          onChange={(value) => setData('assignee', value)}
                          options={users}
                          placeholder="Unassigned"
                          displayKey="name"
                          valueKey="id"
                          searchable={true}
                        />
                      </div>

                      {/* Group */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Group
                        </label>
                        <Select
                          value={data.group}
                          onChange={(value) => setData('group', value)}
                          options={groups}
                          placeholder="Select group"
                          displayKey="name"
                          valueKey="id"
                          searchable={true}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Task Details</h3>
                    <div className="space-y-4">
                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={data.priority}
                          onChange={(value) => setData('priority', value)}
                          options={[
                            { id: 'low', name: 'Low' },
                            { id: 'normal', name: 'Normal' },
                            { id: 'high', name: 'High' },
                            { id: 'urgent', name: 'Urgent' },
                          ]}
                          placeholder="Select priority"
                          displayKey="name"
                          valueKey="id"
                        />
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={data.due_date}
                          onChange={e => setData('due_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                        placeholder="Add tags (press Enter)"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-[#4a154b] text-white rounded-md hover:bg-[#0a2f33] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Watchers */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Watchers</h3>
                    <p className="text-sm text-gray-600 mb-3">Select users to receive notifications</p>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {users.map(user => (
                        <label
                          key={user.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedWatchers.includes(user.id)}
                            onChange={() => toggleWatcher(user.id)}
                            className="rounded border-gray-300 text-[#4a154b] focus:ring-[#4a154b]"
                          />
                          <span className="text-sm">{user.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>
      </AppShell>
    </>
  )
}
