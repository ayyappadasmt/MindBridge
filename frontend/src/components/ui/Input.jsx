import { forwardRef } from "react";
const Input = forwardRef(({ label, error, helper, icon:Icon, className="", type="text", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"><Icon size={16} /></div>}
      <input ref={ref} type={type} className={`input ${Icon?"pl-9":""} ${error?"border-danger-500 focus:ring-danger-400":""} ${className}`} {...props} />
    </div>
    {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
    {helper && !error && <p className="text-xs text-surface-500">{helper}</p>}
  </div>
));
Input.displayName = "Input";
export default Input;
