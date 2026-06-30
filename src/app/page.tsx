"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Pill,
  Stethoscope,
  Soup,
  ClipboardList,
  Users,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Logo from "@/components/ui/Logo";
import RibbonSignature from "@/components/ui/RibbonSignature";

const pasos = [
  {
    numero: "01",
    titulo: "Te registras como voluntario",
    texto:
      "Completas un formulario breve con tus datos, disponibilidad y habilidades.",
    icono: ClipboardList,
  },
  {
    numero: "02",
    titulo: "El organizador clasifica el acopio",
    texto:
      "Cada caja que llega se registra por categoría: medicamentos, insumos o comida.",
    icono: Pill,
  },
  {
    numero: "03",
    titulo: "El despachador entrega con trazabilidad",
    texto:
      "Cada salida queda anotada: qué, cuánto, hacia dónde y quién la autorizó.",
    icono: HeartHandshake,
  },
];

const categorias = [
  { nombre: "Medicamentos", icono: Pill, tone: "azul" },
  { nombre: "Insumos quirúrgicos", icono: Stethoscope, tone: "rojo" },
  { nombre: "Comida", icono: Soup, tone: "gold" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grain absolute inset-0 opacity-[0.035]" />
        <RibbonSignature className="pointer-events-none absolute -right-24 top-10 w-[640px] opacity-70 md:w-[760px]" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 pb-24 pt-16 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <Logo size={160} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-2xl font-display text-4xl font-semibold leading-[1.12] text-ink md:text-6xl"
          >
            Orden en el caos, ayuda donde más se necesita.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-lg text-inkSoft"
          >
            Una sola plataforma para coordinar voluntarios y administrar el
            inventario de los centros de acopio tras el terremoto: lo que
            entra, lo que sale, y a dónde llega.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link href="/registro">
              <Button size="lg">
                <Users size={18} />
                Registrarme como voluntario
              </Button>
            </Link>
            <Link href="/voluntarios">
              <Button size="lg" variant="ghost">
                Ver voluntarios disponibles
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 flex flex-wrap gap-3"
          >
            {categorias.map((c) => (
              <span
                key={c.nombre}
                className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-inkSoft animate-floaty"
              >
                <c.icono size={16} />
                {c.nombre}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="border-t border-ink/8 bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-azul">
              El proceso
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
              Tres pasos, una sola trazabilidad
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pasos.map((p, i) => (
              <motion.div
                key={p.numero}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Card className="h-full p-7">
                  <span className="font-display text-sm text-gold-dark">
                    {p.numero}
                  </span>
                  <div className="mt-3 mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-azul/8 text-azul">
                    <p.icono size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {p.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-inkSoft">
                    {p.texto}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-rojo">
            Roles del equipo
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
            Cada quien con su responsabilidad
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-7">
            <Users className="text-gold-dark" size={22} />
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              Voluntario
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-inkSoft">
              Cualquier persona se registra para ofrecer su tiempo y
              habilidades, y puede consultar el directorio de voluntarios.
            </p>
          </Card>
          <Card className="p-7">
            <ClipboardList className="text-azul" size={22} />
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              Organizador
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-inkSoft">
              Ingresa al inventario lo que llega al centro de acopio, por
              categoría, y revisa el equipo de voluntarios.
            </p>
          </Card>
          <Card className="p-7">
            <ShieldCheck className="text-rojo" size={22} />
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              Despachador
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-inkSoft">
              Registra las salidas hacia hospitales, refugios y familias, y
              consulta el directorio de voluntarios.
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
