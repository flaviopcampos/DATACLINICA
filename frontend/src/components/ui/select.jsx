import React, { useState } from 'react'

const Select = ({ children, value, onValueChange, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            isOpen,
            selectedValue
          })
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onValueChange: handleValueChange
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = ({ children, onClick, isOpen, selectedValue, className = '', ...props }) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      <svg
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

const SelectContent = ({ children, isOpen, onValueChange, className = '', ...props }) => {
  if (!isOpen) return null

  return (
    <div
      className={`absolute top-full z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg ${className}`}
      {...props}
    >
      <div className="max-h-60 overflow-auto p-1">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, { onValueChange })
          }
          return child
        })}
      </div>
    </div>
  )
}

const SelectItem = ({ children, value, onValueChange, className = '', ...props }) => {
  return (
    <button
      type="button"
      className={`w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
}

const SelectValue = ({ placeholder, children, ...props }) => {
  return (
    <span className="block truncate" {...props}>
      {children || placeholder}
    </span>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }