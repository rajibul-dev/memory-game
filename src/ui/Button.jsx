import style from "./button.module.css";

export default function Button({ children, className, ...props }) {
  return (
    <button className={`${style.btn} ${style.type} ${className}`} {...props}>
      {children}
    </button>
  );
}
