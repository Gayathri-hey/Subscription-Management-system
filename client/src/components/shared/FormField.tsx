import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input, type InputProps } from '@/components/ui/input';
import { Select, type SelectProps } from '@/components/ui/select';
import { Textarea, type TextareaProps } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface BaseFormFieldProps {
  label?: string;
  name?: string;
  id?: string;
  required?: boolean;
  error?: string | boolean;
  helperText?: string;
  className?: string;
}

export interface InputFormFieldProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  inputProps?: InputProps;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  children?: never;
}

export interface SelectFormFieldProps extends BaseFormFieldProps {
  type: 'select';
  selectProps?: SelectProps;
  options?: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
}

export interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: 'textarea';
  textareaProps?: TextareaProps;
  placeholder?: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  children?: never;
}

export interface CustomFormFieldProps extends BaseFormFieldProps {
  type: 'custom';
  children: React.ReactNode;
}

export type FormFieldProps =
  | InputFormFieldProps
  | SelectFormFieldProps
  | TextareaFormFieldProps
  | CustomFormFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, id, name, required, error, helperText, className } = props;
  const generatedId = React.useId();
  const fieldId = id || name || generatedId;
  const errorText = typeof error === 'string' ? error : undefined;
  const isError = Boolean(error);

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}

      {props.type === 'select' ? (
        <Select
          id={fieldId}
          name={name}
          error={isError}
          options={props.options}
          placeholder={props.placeholder}
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          {...props.selectProps}
        >
          {props.children}
        </Select>
      ) : props.type === 'textarea' ? (
        <Textarea
          id={fieldId}
          name={name}
          error={isError}
          placeholder={props.placeholder}
          rows={props.rows || 3}
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          {...props.textareaProps}
        />
      ) : props.type === 'custom' ? (
        props.children
      ) : (
        <Input
          id={fieldId}
          name={name}
          type={props.type || 'text'}
          error={isError}
          placeholder={props.placeholder}
          value={props.value}
          defaultValue={props.defaultValue}
          onChange={props.onChange}
          leftAdornment={props.leftAdornment}
          rightAdornment={props.rightAdornment}
          {...props.inputProps}
        />
      )}

      {errorText ? (
        <p className="flex items-center gap-1 text-xs font-medium text-rose-500 animate-in fade-in duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{errorText}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField;

