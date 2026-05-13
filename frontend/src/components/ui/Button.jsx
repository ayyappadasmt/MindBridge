import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const variants = { primary:"btn-primary", secondary:"btn-secondary", ghost:"btn-ghost", danger:"btn-danger" };
const sizes = {
  xs: "px-2.5 py-1.5 text-xs rounded-lg gap-1.5",
  sm: "px-3 py-2 text-sm rounded-xl",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-xl",
  xl: "px-6 py-3.5 text-base rounded-2xl",
};

const Button = forwardRef(({
  children, variant="primary", size="md", loading=false, disabled=false,
  icon:Icon, iconRight:IconRight, className="", onClick, type="button", fullWidth=false, ...props
}, ref) => {
  const isDisabled = disabled || loading;
  const iconSize = (size === "xs" || size === "sm") ? 14 : 16;
  return (
    <motion.button
      ref={ref} type={type} onClick={onClick} disabled={isDisabled}
      className={`${variants[variant]??variants.primary} ${sizes[size]} ${fullWidth?"w-full":""} inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={isDisabled ? {} : { scale: 1.01 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={iconSize} /> : null}
      {children}
      {!loading && IconRight && <IconRight size={14} />}
    </motion.button>
  );
});
Button.displayName = "Button";
export default Button;
