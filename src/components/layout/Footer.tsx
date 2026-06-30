import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-center md:flex-row md:text-left">
        <Logo size={36} />
        <p className="max-w-md text-sm text-inkSoft">
          Coordinamos voluntarios, medicamentos, insumos y alimentos para
          llegar a los afectados por el terremoto con orden y rapidez.
        </p>
        <p className="text-xs text-inkSoft/70">
          © {new Date().getFullYear()} Manos Unidas VE
        </p>
      </div>
    </footer>
  );
}
