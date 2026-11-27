import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { api } from "@/api/axios";
import { siteConfig } from "@/config/siteConfig";

export default function Home() {
  // Temporary: proves frontend, backend and CORS work together
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await api.get<{ status: string }>("/health")).data,
  });

  return (
    <>
      <Helmet>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
      </Helmet>

      <main className="mx-auto max-w-300 px-4 py-10">
        <h1 className="text-3xl text-primary">{siteConfig.name}</h1>
        <p className="mt-2 text-muted">{siteConfig.description}</p>

        <p className="mt-6">
          حالة السيرفر: {health.isLoading && <span className="text-muted">جاري الاتصال...</span>}
          {health.isError && <span className="text-danger">مفيش اتصال بالسيرفر</span>}
          {health.data && <span className="text-success">شغال ({health.data.status})</span>}
        </p>
      </main>
    </>
  );
}
