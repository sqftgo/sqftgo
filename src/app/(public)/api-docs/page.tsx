import type { Metadata } from "next";
import { openApiSpec } from "@/lib/openapi/spec";

export const metadata: Metadata = {
  title: "API docs | SqftGo",
  description: "Minimal OpenAPI reference for the SqftGo marketplace API.",
};

type Operation = {
  tags?: string[];
  summary?: string;
  description?: string;
  security?: unknown[];
};

const METHOD_ORDER = ["get", "post", "put", "patch", "delete"] as const;

export default function ApiDocsPage() {
  const paths = openApiSpec.paths as Record<string, Record<string, Operation>>;
  const rows = Object.entries(paths).flatMap(([path, ops]) =>
    METHOD_ORDER.filter((method) => ops[method]).map((method) => ({
      method,
      path,
      op: ops[method],
    }))
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-charcoal">
      <p className="text-xs font-black uppercase tracking-widest text-terracotta">SqftGo</p>
      <h1 className="mt-2 font-serif text-4xl font-black text-indigo">{openApiSpec.info.title}</h1>
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-charcoal/70">
        {openApiSpec.info.description}
      </p>
      <p className="mt-4 text-sm font-bold">
        Raw spec:{" "}
        <a href="/api/openapi" className="text-terracotta underline">
          /api/openapi
        </a>
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-sand bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand/40 text-xs font-black uppercase tracking-wider text-indigo">
            <tr>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">What it does</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ method, path, op }) => (
              <tr key={`${method}-${path}`} className="border-t border-sand/60 align-top">
                <td className="px-4 py-3 font-black uppercase text-terracotta">{method}</td>
                <td className="px-4 py-3 font-mono text-xs">{path}</td>
                <td className="px-4 py-3">
                  <p className="font-bold">{op.summary}</p>
                  {op.description ? (
                    <p className="mt-1 text-xs font-semibold text-charcoal/60">{op.description}</p>
                  ) : null}
                  {op.security ? (
                    <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-indigo/70">
                      Auth required
                    </p>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
