import { CgSpinner } from "react-icons/cg";
function Spinner() {
  return <div className="absolute top-1/2 left-1/2 -translate-1/2 text-[var(--text)]">
    <CgSpinner className="text-3xl animate-spin"/>
  </div>;
}

export default Spinner;
