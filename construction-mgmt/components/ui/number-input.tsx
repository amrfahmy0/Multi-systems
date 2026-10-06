import { InputHTMLAttributes, forwardRef } from "react";

export const NumberInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const { onChange, type, ...rest } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Convert Arabic numbers to English
    val = val.replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c).toString());
    e.target.value = val;
    if (onChange) onChange(e);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      dir="ltr"
      ref={ref}
      onChange={handleChange}
      {...rest}
    />
  );
});

NumberInput.displayName = "NumberInput";
