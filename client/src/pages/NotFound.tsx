import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-20 text-center">
      <h1 className="text-3xl text-primary">الصفحة غير موجودة</h1>
      <Link to="/" className="mt-6 inline-block text-accent underline">
        ارجع للرئيسية
      </Link>
    </main>
  );
}
