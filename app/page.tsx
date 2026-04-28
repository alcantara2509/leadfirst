"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../utils/supabase/client";

const painPoints = [
  "Leads chegam fora do horário",
  "Clientes falam com vários corretores ao mesmo tempo",
  "Conversas se perdem no WhatsApp",
  "Falta tempo para responder todo mundo com qualidade",
];

const features = [
  "Resposta imediata no WhatsApp",
  "Qualificação automática do interessado",
  "Resumo inteligente do lead",
  "Alerta para o corretor assumir a conversa",
];

const steps = [
  "O cliente chama no WhatsApp",
  "O LeadFirst responde e entende o interesse",
  "O sistema organiza as informações do lead",
  "O corretor assume quando a oportunidade está quente",
];

const controls = [
  "O corretor pode assumir a conversa",
  "A IA não fecha negócio sozinha",
  "O foco é reduzir perda de oportunidade",
  "O cliente continua no mesmo contato",
];

const actingOptions = [
  "Venda",
  "Aluguel de temporada",
  "Aluguel anual",
  "Mais de uma opção",
];

const leadVolumeOptions = ["0 a 5", "6 a 15", "16 a 30", "Mais de 30"];

type SubmitStatus = "idle" | "loading" | "success" | "error";

type WaitlistFormValues = {
  name: string;
  phone: string;
  city: string;
  mainActivity: string;
  leadsPerWeek: string;
  acceptInterview: boolean;
  source: string;
};

let hasTrackedInitialLoad = false;

function getSource() {
  if (typeof window === "undefined") {
    return "direct";
  }

  return new URLSearchParams(window.location.search).get("utm_source") || "direct";
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

async function trackEvent(eventName: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("events").insert({
      event_name: eventName,
      page: window.location.pathname,
      source: getSource(),
      user_agent: navigator.userAgent,
    });

    if (error) {
      console.error("Supabase event error:", error);
    }
  } catch (error) {
    console.error("Supabase event error:", error);
  }
}

function SectionLabel({
  children,
  tone = "emerald",
}: {
  children: string;
  tone?: "emerald" | "rose";
}) {
  const className =
    tone === "rose"
      ? "mb-3 inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-500"
      : "mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700";

  return (
    <span className={className}>
      {children}
    </span>
  );
}

function PainCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-lg font-bold text-rose-500">
        !
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
    </div>
  );
}

function FeatureCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-600">
        ✓
      </div>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select
        name={name}
        required
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        defaultValue=""
      >
        <option value="" disabled>
          Selecione uma opção
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default function Home() {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const finalSectionRef = useRef<HTMLElement>(null);
  const formStartedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedInitialLoad) {
      return;
    }

    hasTrackedInitialLoad = true;
    const supabase = createClient();

    void (async () => {
      try {
        const { error } = await supabase.rpc("increment_total_views");

        if (error) {
          console.error("Supabase views error:", error);
        }
      } catch (error) {
        console.error("Supabase views error:", error);
      }
    })();

    void trackEvent("page_view");
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && submitStatus !== "loading") {
        setIsModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, submitStatus]);

  useEffect(() => {
    if (submitStatus !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSubmitStatus("idle");
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [submitStatus]);

  function scrollToFinalSection() {
    finalSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function handleHeroCtaClick() {
    void trackEvent("hero_cta_clicked");
    scrollToFinalSection();
  }

  function handleFinalCtaClick() {
    void trackEvent("final_cta_clicked");
    setSubmitStatus("idle");
    setSubmitError("");
    setIsModalOpen(true);
  }

  function handleFormStarted() {
    if (formStartedRef.current) {
      return;
    }

    formStartedRef.current = true;
    void trackEvent("form_started");
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    event.currentTarget.value = formatPhone(event.currentTarget.value);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus("loading");
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = (field: string) => String(formData.get(field) ?? "").trim();
    const values: WaitlistFormValues = {
      name: value("name"),
      phone: value("phone"),
      city: value("city"),
      mainActivity: value("acting"),
      leadsPerWeek: value("leadVolume"),
      acceptInterview: value("feedback") === "Sim",
      source: getSource(),
    };
    const supabase = createClient();

    const { error } = await supabase.from("waitlist_leads").insert({
      name: values.name,
      phone: values.phone,
      city: values.city,
      main_activity: values.mainActivity,
      leads_per_week: values.leadsPerWeek,
      accept_interview: values.acceptInterview,
      source: values.source,
    });

    if (error) {
      setSubmitStatus("error");
      setSubmitError("Não foi possível enviar seu cadastro. Tente novamente.");
      return;
    }

    await trackEvent("form_submitted");
    form.reset();
    setSubmitStatus("success");
    setIsModalOpen(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {submitStatus === "success" && (
        <div
          role="status"
          className="fixed right-4 top-20 z-[60] w-[calc(100%-2rem)] max-w-md rounded-2xl border border-emerald-700 bg-emerald-700 p-4 text-sm font-semibold text-white shadow-2xl shadow-emerald-900/25 sm:right-6 sm:top-24"
        >
          Cadastro recebido. Você entrou na lista de acesso antecipado do
          LeadFirst.
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-emerald-200/70 bg-emerald-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <a href="#" className="text-xl font-bold tracking-tight text-slate-950">
            LeadFirst
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
            <a className="transition hover:text-slate-950" href="#problema">
              Problema
            </a>
            <a className="transition hover:text-slate-950" href="#solucao">
              Solução
            </a>
            <a className="transition hover:text-slate-950" href="#como-funciona">
              Como funciona
            </a>
            <a className="transition hover:text-slate-950" href="#lista-de-espera">
              Faça parte
            </a>
          </nav>
          <a
            href="#lista-de-espera"
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Quero testar grátis
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-100/80 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Responda seus leads antes dos outros corretores
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              LeadFirst ajuda corretores a atender interessados no WhatsApp em
              segundos, qualificar oportunidades e assumir a conversa no momento
              certo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleHeroCtaClick}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"
              >
                Quero testar grátis
              </button>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">
              Acesso antecipado para corretores de Itapema e região.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[360px]">
              <div className="absolute -left-5 top-20 h-20 w-2 rounded-l-2xl bg-slate-800" />
              <div className="absolute -right-5 top-28 h-28 w-2 rounded-r-2xl bg-slate-800" />
              <div className="rounded-[3rem] border-[10px] border-slate-950 bg-slate-950 p-2 shadow-2xl shadow-slate-400/60">
                <div className="relative overflow-hidden rounded-[2.35rem] bg-slate-950">
                  <div className="absolute left-1/2 top-3 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-slate-950" />
                  <div className="bg-emerald-500 px-5 pb-4 pt-14 text-slate-950">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold">Atendimento automático</p>
                        <p className="text-xs font-medium text-emerald-950/70">
                          WhatsApp conectado
                        </p>
                      </div>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-emerald-800">
                        Online
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 px-4 py-5">
                    <div className="max-w-[86%] rounded-2xl rounded-tl-sm bg-white/10 p-3 shadow-sm">
                      <p className="text-sm leading-6 text-slate-100">
                        Oi, tenho interesse em apartamento em Itapema para
                        comprar.
                      </p>
                      <p className="mt-1 text-right text-[11px] text-slate-500">
                        19:42
                      </p>
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-emerald-500 p-3 shadow-sm">
                      <p className="text-sm font-medium leading-6 text-slate-950">
                        Perfeito. Você busca para morar ou investir? Tem faixa de
                        valor definida?
                      </p>
                      <p className="mt-1 text-right text-[11px] text-emerald-950/60">
                        LeadFirst
                      </p>
                    </div>
                    <div className="max-w-[86%] rounded-2xl rounded-tl-sm bg-white/10 p-3 shadow-sm">
                      <p className="text-sm leading-6 text-slate-100">
                        Investimento. Até R$ 1,2 milhão, perto da praia.
                      </p>
                      <p className="mt-1 text-right text-[11px] text-slate-500">
                        19:43
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                      Oportunidade quente
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Compra em Itapema, perfil investidor, orçamento definido e
                      preferência por praia.
                    </p>
                    <button className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
                      Assumir conversa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problema" className="scroll-mt-24 px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionLabel tone="rose">Problema</SectionLabel>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Enquanto você demora para responder, outro corretor fecha o cliente
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              No mercado imobiliário, velocidade muda o jogo. O primeiro contato
              define confiança, prioridade e chance real de avançar a negociação.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point) => (
              <PainCard key={point} title={point} />
            ))}
          </div>
        </div>
      </section>

      <section id="solucao" className="scroll-mt-24 bg-white px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Solução</SectionLabel>
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Seu WhatsApp trabalhando antes mesmo de você abrir a conversa
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              O LeadFirst inicia o atendimento, entende o que o cliente procura,
              coleta dados importantes e entrega um resumo claro para o corretor
              agir com contexto.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <FeatureCard key={feature} title={feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Como funciona</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Simples para o corretor. Rápido para o cliente.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70"
              >
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold leading-7 text-slate-950">
                  {step}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <span className="mb-3 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-200">
              Controle e segurança
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Você continua no controle
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              A ideia não é substituir o corretor. O LeadFirst acelera o
              primeiro atendimento, organiza as informações e permite que você
              assuma a conversa quando fizer sentido.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {controls.map((control) => (
              <div
                key={control}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-slate-950">
                  ✓
                </div>
                <p className="font-semibold text-white">{control}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={finalSectionRef}
        id="lista-de-espera"
        className="relative scroll-mt-24 overflow-hidden bg-white px-5 py-16 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(16,185,129,0.22)_0px,rgba(16,185,129,0.22)_2px,transparent_2px,transparent_24px)]" />
        <div className="absolute inset-0 bg-white/55" />
        <div className="relative mx-auto max-w-7xl">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-10 shadow-xl shadow-emerald-100/80 sm:px-10 sm:py-12 lg:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Faça parte
            </p>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Seja um dos primeiros a testar o LeadFirst
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Estamos liberando acesso gratuito por tempo limitado para
                corretores de Itapema, Porto Belo e Balneário Camboriú que querem
                responder leads antes da concorrência.
              </p>
              <button
                type="button"
                onClick={handleFinalCtaClick}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 sm:w-1/2"
              >
                Entrar agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl shadow-slate-950/30 sm:p-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitStatus === "loading"}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Fechar formulário"
            >
              ×
            </button>

            <div className="mb-7 pr-10">
              <SectionLabel>Acesso antecipado</SectionLabel>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Entre na lista de acesso antecipado
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Preencha seus dados para entrar na lista de espera do LeadFirst.
                Estamos selecionando corretores para testar a ferramenta grátis
                por tempo limitado.
              </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div
                onFocus={handleFormStarted}
                className="grid gap-5 sm:grid-cols-2"
              >
                <Field label="Nome">
                  <input
                    name="name"
                    required
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Seu nome"
                  />
                </Field>

                <Field label="WhatsApp">
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    onChange={handlePhoneChange}
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="(47) 99999-9999"
                  />
                </Field>

                <Field label="Cidade">
                  <input
                    name="city"
                    required
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Itapema"
                  />
                </Field>

                <SelectField
                  label="Principal atuação"
                  name="acting"
                  options={actingOptions}
                />

                <SelectField
                  label="Quantos leads você recebe por semana?"
                  name="leadVolume"
                  options={leadVolumeOptions}
                />

                <SelectField
                  label="Aceitaria ter uma conversa rápida por WhatsApp para dar feedback?"
                  name="feedback"
                  options={["Sim", "Não"]}
                />
              </div>

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="mt-7 flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
              >
                {submitStatus === "loading" ? "Enviando..." : "Entrar na lista"}
              </button>

              {submitStatus === "error" && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                  {submitError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-slate-50 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-slate-500">
            © 2026 LeadFirst. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
