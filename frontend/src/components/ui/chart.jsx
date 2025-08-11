import * as React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs w-full h-[300px]",
          className
        )}
        {...props}
      >
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 grid min-w-[8rem] items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!hideLabel && label && (
        <div className={cn("font-medium", labelClassName)}>{label}</div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = config?.[key] || {}
          const indicatorColor = color || item.color

          return (
            <div
              key={item.dataKey || index}
              className="flex w-full flex-wrap items-stretch gap-2"
            >
              {!hideIndicator && (
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: indicatorColor,
                  }}
                />
              )}
              <div className="flex flex-1 justify-between leading-none">
                <span className="text-gray-600">
                  {itemConfig?.label || item.name}
                </span>
                {item.value && (
                  <span className="font-mono font-medium tabular-nums">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartTooltip = ({ content, ...props }) => {
  return React.cloneElement(content, props)
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
}