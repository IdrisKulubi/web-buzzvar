import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface BaseFieldProps {
  label?: string
  error?: string
  required?: boolean
  className?: string
  description?: string
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url"
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  name?: string
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  rows?: number
  name?: string
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  options: { value: string; label: string }[]
  name?: string
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  name?: string
}

export const FormField = forwardRef<HTMLDivElement, BaseFieldProps & { children: React.ReactNode }>(
  ({ label, error, required, className, description, children }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {children}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className, description, type = "text", placeholder, value, onChange, name, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} className={className} description={description}>
        <Input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          name={name}
          className={error ? "border-red-500" : ""}
          {...props}
        />
      </FormField>
    )
  }
)

InputField.displayName = "InputField"

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, required, className, description, placeholder, value, onChange, rows = 3, name, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} className={className} description={description}>
        <Textarea
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          name={name}
          className={error ? "border-red-500" : ""}
          {...props}
        />
      </FormField>
    )
  }
)

TextareaField.displayName = "TextareaField"

export function SelectField({ 
  label, 
  error, 
  required, 
  className, 
  description, 
  placeholder, 
  value, 
  onChange, 
  options, 
  name 
}: SelectFieldProps) {
  return (
    <FormField label={label} error={error} required={required} className={className} description={description}>
      <Select value={value} onValueChange={onChange} name={name}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
}

export function CheckboxField({ 
  label, 
  error, 
  required, 
  className, 
  description, 
  checked, 
  onChange, 
  name 
}: CheckboxFieldProps) {
  return (
    <FormField error={error} className={className} description={description}>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={checked}
          onCheckedChange={onChange}
          name={name}
        />
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
      </div>
    </FormField>
  )
}