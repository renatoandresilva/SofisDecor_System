import { SelectHTMLAttributes, CSSProperties } from "react"

// Select
type Option = React.OptionHTMLAttributes<HTMLOptionElement>

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    placeholder?: string;
    option?: Option;
    values: string[];
    style?: CSSProperties | undefined;
    str?: string;
}


