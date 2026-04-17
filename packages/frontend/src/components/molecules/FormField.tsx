import React from 'react';
import { Input, InputProps } from '../atoms/Input';
import { Label, LabelProps } from '../atoms/Label';
import { cn } from '../../utils/cn';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  id: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  labelProps?: Partial<LabelProps>;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, helperText, error, required = false, labelProps, className, ...inputProps }, ref) => {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Label htmlFor={id} required={required} {...labelProps}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={id}
          error={error}
          valid={!error && !!inputProps.value}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...inputProps}
        />
        {error && (
          <span id={`${id}-error`} className="text-xs text-error font-medium">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={`${id}-helper`} className="text-xs text-text-secondary">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
