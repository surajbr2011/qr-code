export default function Badge({ label, type }) {
  const styles =
    type === "success"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles}`}>
      {label}
    </span>
  );
}
