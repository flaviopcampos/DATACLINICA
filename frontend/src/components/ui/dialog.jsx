import React, { useState, createContext, useContext } from 'react'

const DialogContext = createContext()

const Dialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false)

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild, ...props }) => {
  const { setIsOpen } = useContext(DialogContext)

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(true),
      ...props
    })
  }

  return (
    <button onClick={() => setIsOpen(true)} {...props}>
      {children}
    </button>
  )
}

const DialogContent = ({ children, className = '', ...props }) => {
  const { isOpen, setIsOpen } = useContext(DialogContext)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dialog */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className={className} {...props}>
          {children}
        </div>
        
        {/* Close button */}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          onClick={() => setIsOpen(false)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  )
}

const DialogHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
      {children}
    </div>
  )
}

const DialogTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}

const DialogDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </p>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }