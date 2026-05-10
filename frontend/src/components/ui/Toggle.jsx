import { motion } from "framer-motion";
export default function Toggle({ checked=false, onChange, label, description, disabled=false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label||description) && <div>{label&&<p className="text-sm font-medium text-surface-800 dark:text-surface-200">{label}</p>}{description&&<p className="text-xs text-surface-500 mt-0.5">{description}</p>}</div>}
      <button role="switch" aria-checked={checked} onClick={()=>!disabled&&onChange?.(!checked)} disabled={disabled}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked?"bg-brand-500":"bg-surface-200 dark:bg-surface-700"}`}>
        <motion.span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 20 : 0 }} transition={{ type:"spring", stiffness:500, damping:40 }} />
      </button>
    </div>
  );
}
