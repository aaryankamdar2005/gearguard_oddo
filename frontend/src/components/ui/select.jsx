// import * as React from "react"
// import * as SelectPrimitive from "@radix-ui/react-select"
// import { Check, ChevronDown, ChevronUp } from "lucide-react"

// import { cn } from "@/lib/utils"

// const Select = SelectPrimitive.Root

// const SelectGroup = SelectPrimitive.Group

// const SelectValue = SelectPrimitive.Value

// const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
//   <SelectPrimitive.Trigger
//     ref={ref}
//     className={cn(
//       "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
//       className
//     )}
//     {...props}>
//     {children}
//     <SelectPrimitive.Icon asChild>
//       <ChevronDown className="h-4 w-4 opacity-50" />
//     </SelectPrimitive.Icon>
//   </SelectPrimitive.Trigger>
// ))
// SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

// const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
//   <SelectPrimitive.ScrollUpButton
//     ref={ref}
//     className={cn("flex cursor-default items-center justify-center py-1", className)}
//     {...props}>
//     <ChevronUp className="h-4 w-4" />
//   </SelectPrimitive.ScrollUpButton>
// ))
// SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

// const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
//   <SelectPrimitive.ScrollDownButton
//     ref={ref}
//     className={cn("flex cursor-default items-center justify-center py-1", className)}
//     {...props}>
//     <ChevronDown className="h-4 w-4" />
//   </SelectPrimitive.ScrollDownButton>
// ))
// SelectScrollDownButton.displayName =
//   SelectPrimitive.ScrollDownButton.displayName

// const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
//   <SelectPrimitive.Portal>
//     <SelectPrimitive.Content
//       ref={ref}
//       className={cn(
//         "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
//         position === "popper" &&
//           "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
//         className
//       )}
//       position={position}
//       {...props}>
//       <SelectScrollUpButton />
//       <SelectPrimitive.Viewport
//         className={cn("p-1", position === "popper" &&
//           "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
//         {children}
//       </SelectPrimitive.Viewport>
//       <SelectScrollDownButton />
//     </SelectPrimitive.Content>
//   </SelectPrimitive.Portal>
// ))
// SelectContent.displayName = SelectPrimitive.Content.displayName

// const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
//   <SelectPrimitive.Label
//     ref={ref}
//     className={cn("px-2 py-1.5 text-sm font-semibold", className)}
//     {...props} />
// ))
// SelectLabel.displayName = SelectPrimitive.Label.displayName

// const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
//   <SelectPrimitive.Item
//     ref={ref}
//     className={cn(
//       "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
//       className
//     )}
//     {...props}>
//     <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
//       <SelectPrimitive.ItemIndicator>
//         <Check className="h-4 w-4" />
//       </SelectPrimitive.ItemIndicator>
//     </span>
//     <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
//   </SelectPrimitive.Item>
// ))
// SelectItem.displayName = SelectPrimitive.Item.displayName

// const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
//   <SelectPrimitive.Separator
//     ref={ref}
//     className={cn("-mx-1 my-1 h-px bg-muted", className)}
//     {...props} />
// ))
// SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// export {
//   Select,
//   SelectGroup,
//   SelectValue,
//   SelectTrigger,
//   SelectContent,
//   SelectLabel,
//   SelectItem,
//   SelectSeparator,
//   SelectScrollUpButton,
//   SelectScrollDownButton,
// }

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

/* ---------- TRIGGER ---------- */
const SelectTrigger = React.forwardRef(function SelectTrigger(
  { className, children, ...props },
  ref
) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-[16px] shadow-sm focus:outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-slate-500" />
    </SelectPrimitive.Trigger>
  )
})

/* ---------- CONTENT ---------- */
const SelectContent = React.forwardRef(function SelectContent(
  { className, children, ...props },
  ref
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-80 overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-lg",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})

/* ---------- ITEM ---------- */
const SelectItem = React.forwardRef(function SelectItem(
  { className, children, ...props },
  ref
) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-[16px] outline-none focus:bg-slate-100 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
})

const SelectSeparator = React.forwardRef(function SelectSeparator(
  { className, ...props },
  ref
) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("my-1 h-px bg-slate-200", className)}
      {...props}
    />
  )
})

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
}
