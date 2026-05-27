"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { leadInputSchema } from "@/lib/leadSchema";
import { priorityOptions, statusOptions } from "@/lib/constants";

type LeadFormProps = {
  defaultValues?: Record<string, unknown>;
  mode?: "create" | "edit";
  leadId?: string;
};

export function LeadForm({ defaultValues, mode = "create", leadId }: LeadFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(mode === "create" ? leadInputSchema : leadInputSchema.partial()),
    defaultValues: {
      status: "NEW",
      priority: "MEDIUM",
      ...defaultValues
    }
  });

  async function onSubmit(values: Record<string, unknown>) {
    setMessage("");
    const response = await fetch(mode === "edit" && leadId ? `/api/leads/${leadId}` : "/api/leads", {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values)
    });
    const json = await response.json();

    if (!response.ok) {
      setMessage(json.error || "Não foi possível salvar.");
      return;
    }

    if (json.duplicate) {
      setMessage("Lead duplicado encontrado. Abrindo o registro existente.");
    }

    router.push(`/leads/${json.lead.id}`);
    router.refresh();
  }

  const errorText = Object.values(errors)[0]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome da empresa" error={errors.businessName?.message}>
          <input className="field" {...register("businessName")} />
        </Field>
        <Field label="Nome fantasia">
          <input className="field" {...register("tradeName")} />
        </Field>
        <Field label="CNPJ">
          <input className="field" {...register("document")} />
        </Field>
        <Field label="Telefone">
          <input className="field" {...register("phone")} />
        </Field>
        <Field label="WhatsApp">
          <input className="field" {...register("whatsapp")} />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input className="field" type="email" {...register("email")} />
        </Field>
        <Field label="Site">
          <input className="field" placeholder="https://empresa.com.br" {...register("website")} />
        </Field>
        <Field label="Instagram">
          <input className="field" placeholder="@empresa" {...register("instagram")} />
        </Field>
        <Field label="Cidade">
          <input className="field" {...register("city")} />
        </Field>
        <Field label="Estado">
          <input className="field" maxLength={2} {...register("state")} />
        </Field>
        <Field label="Nicho">
          <input className="field" {...register("niche")} />
        </Field>
        <Field label="Fonte">
          <input className="field" {...register("source")} />
        </Field>
        <Field label="Status">
          <select className="field" {...register("status")}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Prioridade">
          <select className="field" {...register("priority")}>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Último contato">
          <input className="field" type="datetime-local" {...register("lastContactAt")} />
        </Field>
        <Field label="Próxima ação">
          <input className="field" type="datetime-local" {...register("nextActionAt")} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Observações">
            <textarea className="field min-h-28" {...register("notes")} />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={isSubmitting}>
          <Save size={16} />
          {isSubmitting ? "Salvando..." : "Salvar lead"}
        </button>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
        {errorText ? <p className="text-sm text-red-600">{String(errorText)}</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error
}: {
  label: string;
  children: React.ReactNode;
  error?: unknown;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{String(error)}</span> : null}
    </label>
  );
}
