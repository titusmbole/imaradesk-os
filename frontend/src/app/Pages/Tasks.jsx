import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import Popover from '../components/Popover'
import { THEME, COLORS } from '../constants/theme'

export default function Tasks({ sidebar = {}, tasks = [], counters = {}, currentView = null, pagination = null, draftsCount = 0 }) {
  const [viewsOpen, setViewsOpen] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'card'
  const [selectedTasks, setSelectedTasks] = useState([])
  const [isMarkingDraft, setIsMarkingDraft] = useState(false)

  const views = sidebar.views || [
    { id: 'all', label: 'All Tasks', count: counters.all || 0 },
    { id: 'my_tasks', label: 'My Tasks', count: counters.my_tasks || 0 },
    { id: 'created_by_me', label: 'Created by Me', count: counters.created_by_me || 0 },
    { id: 'watching', label: 'Watching', count: counters.watching || 0 },
    { id: 'todo', label: 'To Do', count: counters.todo || 0 },
    { id: 'in_progress', label: 'In Progress', count: counters.in_progress || 0 },
    { id: 'review', label: 'In Review', count: counters.review || 0 },
    { id: 'done', label: 'Done', count: counters.done || 0 },
    { id: 'high_priority', label: 'High Priority', count: counters.high_priority || 0 },
  ]

  // Find default view (is_default: true) or fallback to first view
  const defaultView = views.find(v => v.is_default) || views[0]
  // Use currentView if provided, otherwise use the default view's id
  const activeViewId = currentView || (defaultView ? defaultView.id : 'all')

  const loadView = (viewId) => {
    router.visit(`/tasks?view=${viewId}`, {
      preserveState: true,
      preserveScroll: true,
    })
    setSelectedTasks([]) // Clear selections when changing views
  }

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const toggleAllTasks = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(tasks.map(t => t.id))
    }
  }

  const markSelectedAsDraft = async () => {
    if (selectedTasks.length === 0) return
    
    setIsMarkingDraft(true)
    try {
      const response = await fetch('/tasks/bulk/mark-draft/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        body: JSON.stringify({ task_ids: selectedTasks }),
      })
      
      if (response.ok) {
        router.reload({ preserveScroll: true })
        setSelectedTasks([])
      }
    } catch (error) {
      console.error('Failed to mark tasks as draft:', error)
    } finally {
      setIsMarkingDraft(false)
    }
  }

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-700',
    todo: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    review: 'bg-purple-100 text-purple-700',
    done: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const priorityColors = {
    low: 'text-gray-600',
    normal: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  }

  // Get the current view label
  const activeView = views.find(v => v.id === activeViewId)
  const pageTitle = activeView ? activeView.label : 'All Tasks'

  return (
    <>
      <Head title={pageTitle} />
      <AppShell active="tasks">
        {/* Content row: Views sidebar + main list */}
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
        {/* Views Sidebar */}
        {viewsOpen && (
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-gray-800 font-semibold">Views</h2>
            <div className="flex items-center gap-2 text-gray-500">
              <button onClick={() => setViewsOpen(false)} className="hover:text-gray-700" title="Collapse">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 12h12v2H6z"/></svg>
              </button>
              <button className="hover:text-gray-700" title="Add">+</button>
            </div>
          </div>

          <nav className="p-2 flex-1 overflow-y-auto">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => loadView(v.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                  activeViewId === v.id
                    ? 'bg-[#4a154b]/10 text-[#4a154b] font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}>
                <span className="truncate">{v.label}</span>
                <span className={`ml-3 inline-flex items-center justify-center rounded-full text-xs px-2 py-0.5 ${
                  activeViewId === v.id
                    ? 'bg-[#4a154b]/20 text-[#4a154b]'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {v.count}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-gray-200 p-2 space-y-1">
            {/* Drafts link */}
            <button
              onClick={() => loadView('drafts')}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                activeViewId === 'drafts'
                  ? 'bg-[#4a154b]/10 text-[#4a154b] font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
              style={activeViewId === 'drafts' ? { borderLeft: `3px solid ${COLORS.primary}` } : {}}
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Drafts
              </span>
              <span className={`ml-3 inline-flex items-center justify-center rounded-full text-xs px-2 py-0.5 ${
                activeViewId === 'drafts'
                  ? 'bg-[#4a154b]/20 text-[#4a154b]'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {draftsCount}
              </span>
            </button>
            
            <Popover
              trigger={
                <button className={`w-full px-3 py-2 text-sm ${THEME.link} text-left rounded-md hover:bg-[#4a154b]/5 transition-colors`}>
                  Manage Views
                </button>
              }
              position="top-left"
            >
              {({ close }) => (
                <div className="py-1">
                  <button
                    onClick={() => {
                      setViewMode('list')
                      close()
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      viewMode === 'list' ? 'text-[#4a154b] bg-[#4a154b]/10' : 'text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                    </svg>
                    List View
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('card')
                      close()
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      viewMode === 'card' ? 'text-[#4a154b] bg-[#4a154b]/10' : 'text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    Card View
                  </button>
                </div>
              )}
            </Popover>
          </div>
        </aside>
        )}

        {/* Main */}
        <main className="flex-1">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                title={viewsOpen ? 'Hide Views' : 'Show Views'}
                onClick={() => setViewsOpen(v => !v)}
                aria-expanded={viewsOpen}
              >
                {viewsOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500"><path d="M10.5 6 3 12l7.5 6v-4.5H21v-3H10.5V6z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500"><path d="M13.5 6 21 12l-7.5 6v-4.5H3v-3h10.5V6z"/></svg>
                )}
              </button>
              <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Filter</button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                Actions
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Bulk actions toolbar */}
              {selectedTasks.length > 0 && (
                <div className="px-4 py-3 bg-[#4a154b]/5 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markSelectedAsDraft}
                      disabled={isMarkingDraft}
                      className={`${THEME.button.primary} px-3 py-1.5 rounded-md text-sm flex items-center gap-2 disabled:opacity-50`}
                    >
                      {isMarkingDraft ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Marking...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          Mark as Draft
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedTasks([])}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
              <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">{tasks.length} task{tasks.length === 1 ? '' : 's'}</div>
              
              {viewMode === 'list' ? (
                // List View (Table)
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="w-10 p-3 text-left">
                        <input 
                          type="checkbox" 
                          checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                          onChange={toggleAllTasks}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="p-3 text-left">Task</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Priority</th>
                      <th className="p-3 text-left">Assignee</th>
                      <th className="p-3 text-left">Due Date</th>
                      <th className="p-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-500">
                          No tasks found. <Link href="/tasks/new/" className="text-[#4a154b] hover:underline">Create your first task</Link>
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr key={task.id} className={`border-t border-gray-200 hover:bg-gray-50 ${selectedTasks.includes(task.id) ? 'bg-[#4a154b]/5' : ''}`}>
                          <td className="p-3">
                            <input 
                              type="checkbox" 
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="p-3">
                            <Link href={`/tasks/${task.id}/`} className={THEME.link}>
                              <div className="font-medium">#{task.id} {task.title}</div>
                              <div className="text-xs text-gray-500 truncate max-w-md">{task.description}</div>
                            </Link>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
                              {task.status_display}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`font-medium ${priorityColors[task.priority] || 'text-gray-600'}`}>
                              {task.priority_display}
                            </span>
                          </td>
                          <td className="p-3">{task.assignee?.name || 'Unassigned'}</td>
                          <td className="p-3">{task.due_date || '-'}</td>
                          <td className="p-3">{task.created_at}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                // Card View (Grid)
                <div className="p-4">
                  {tasks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No tasks found. <Link href="/tasks/new/" className="text-[#4a154b] hover:underline">Create your first task</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all ${selectedTasks.includes(task.id) ? 'ring-2 ring-[#4a154b]' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Link href={`/tasks/${task.id}/`} className="text-xs font-medium text-gray-500 hover:text-[#4a154b]">#{task.id}</Link>
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
                                {task.status_display}
                              </span>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={selectedTasks.includes(task.id)}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="mt-1 rounded border-gray-300"
                            />
                          </div>
                          
                          <Link href={`/tasks/${task.id}/`} className="block">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-[#4a154b]">
                              {task.title}
                            </h3>
                          </Link>
                          
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                          
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              <span className="truncate">{task.assignee?.name || 'Unassigned'}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                              </svg>
                              <span>{task.due_date || 'No due date'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority_display}
                            </span>
                            {task.department && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                {task.department}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {pagination && pagination.total_pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 mt-4 border-t border-gray-200 bg-white rounded-b-lg">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => router.get(`/tasks?view=${currentView}&page=${pagination.current_page - 1}`)}
                          disabled={!pagination.has_previous}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => router.get(`/tasks?view=${currentView}&page=${pagination.current_page + 1}`)}
                          disabled={!pagination.has_next}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{pagination.current_page}</span> of{' '}
                            <span className="font-medium">{pagination.total_pages}</span>
                            {' '}({pagination.total_count} total tasks)
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => router.get(`/tasks?view=${currentView}&page=${pagination.current_page - 1}`)}
                              disabled={!pagination.has_previous}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Previous</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            {[...Array(pagination.total_pages)].map((_, idx) => {
                              const pageNum = idx + 1;
                              if (
                                pageNum === 1 ||
                                pageNum === pagination.total_pages ||
                                (pageNum >= pagination.current_page - 2 && pageNum <= pagination.current_page + 2)
                              ) {
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => router.get(`/tasks?view=${currentView}&page=${pageNum}`)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      pageNum === pagination.current_page
                                        ? 'z-10 bg-[#4a154b] border-[#4a154b] text-white'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              } else if (
                                pageNum === pagination.current_page - 3 ||
                                pageNum === pagination.current_page + 3
                              ) {
                                return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                              }
                              return null;
                            })}
                            <button
                              onClick={() => router.get(`/tasks?view=${currentView}&page=${pagination.current_page + 1}`)}
                              disabled={!pagination.has_next}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Next</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
        </div>

        {/* Floating Action Button */}
        <Link href="/tasks/new/" className={THEME.fab} title="Add Task">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Link>
      </AppShell>
    </>
  )
}
