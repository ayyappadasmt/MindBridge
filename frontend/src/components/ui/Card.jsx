import { motion } from "framer-motion";
export default function Card({ children, className="", glass=false, hover=false, padding="md", onClick, as:Tag="div", ...props }) {
  const paddings = { none:"", sm:"p-4", md:"p-5 md:p-6", lg:"p-6 md:p-8", xl:"p-8 md:p-10" };
  const base = glass ? "glass" : "card";
  const Comp = onClick ? motion.div : Tag;
  const motionProps = onClick ? { whileHover:{scale:1.005,y:-1}, whileTap:{scale:0.998}, onClick, style:{cursor:"pointer"} } : {};
  return (
    <Comp className={`${base} ${paddings[padding]} ${className}`} {...motionProps} {...(onClick?{}:props)}>
      {children}
    </Comp>
  );
}
export function CardHeader({ children, className="", action }) {
  return <div className={`flex items-center justify-between mb-5 ${className}`}><div className="space-y-0.5">{children}</div>{action&&<div className="flex-shrink-0">{action}</div>}</div>;
}
export function CardTitle({ children, className="" }) {
  return <h3 className={`text-base font-semibold text-surface-900 dark:text-surface-100 ${className}`}>{children}</h3>;
}
export function CardDescription({ children, className="" }) {
  return <p className={`text-sm text-surface-500 dark:text-surface-400 ${className}`}>{children}</p>;
}
