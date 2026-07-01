import { motion } from "framer-motion";
import { MapPin, Phone, Wrench, Car, Award } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Voluntario } from "@/types";

const DISPONIBILIDAD_LABEL: Record<string, string> = {
  fines_de_semana: "Fines de semana",
  entre_semana: "Entre semana",
  tiempo_completo: "Tiempo completo",
  por_llamado: "Por llamado urgente",
};

export default function VoluntarioCard({
  voluntario,
  index = 0,
}: {
  voluntario: Voluntario;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="flex h-full flex-col gap-3 p-6">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">
            {voluntario.nombre_completo}
          </h3>
          {voluntario.experiencia_previa && (
            <Badge tone="rojo">
              <Award size={12} className="mr-1" /> Con experiencia
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-inkSoft">
          <span className="flex items-center gap-2">
            <MapPin size={14} /> {voluntario.ciudad}
          </span>
          <span className="flex items-center gap-2">
            <Phone size={14} /> {voluntario.telefono}
          </span>
          <span className="flex items-center gap-2">
            <Wrench size={14} />{" "}
            {voluntario.voluntario_habilidades
              ? voluntario.voluntario_habilidades
                  .map((vh) => vh.habilidades?.nombre)
                  .filter(Boolean)
                  .join(", ")
              : voluntario.habilidades}
          </span>
          {voluntario.vehiculo_propio && (
            <span className="flex items-center gap-2">
              <Car size={14} /> Tiene vehículo propio
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {voluntario.voluntario_disponibilidades &&
          voluntario.voluntario_disponibilidades.length > 0 ? (
            voluntario.voluntario_disponibilidades.map((vd, i) => (
              <Badge tone="azul" key={i}>
                {vd.disponibilidades?.nombre}
              </Badge>
            ))
          ) : (
            <Badge tone="azul">
              {DISPONIBILIDAD_LABEL[voluntario.disponibilidad ?? ""] ??
                voluntario.disponibilidad}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
