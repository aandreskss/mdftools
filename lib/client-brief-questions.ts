// Preguntas precargadas para el brief de exploración del cliente
// Basadas en metodología estratégica de marca e identidad visual

export type QuestionType = "text" | "textarea" | "file" | "url" | "scale";

export interface BriefQuestion {
  id: string;
  category: string;
  question: string;
  placeholder?: string;
  type: QuestionType;
  required: boolean;
  hint?: string; // texto de ayuda para el cliente
}

export const BRIEF_CATEGORIES = [
  "Tu Empresa",
  "ADN de la Marca",
  "Mercado y Audiencia",
  "Objetivos del Proyecto",
  "Estética y Referencias",
  "Información Técnica",
] as const;

export const PRELOADED_QUESTIONS: BriefQuestion[] = [
  // ── Tu Empresa ──────────────────────────────────────────────────
  {
    id: "emp_1",
    category: "Tu Empresa",
    question: "¿Cómo se llama tu empresa o proyecto?",
    placeholder: "Nombre comercial o nombre del proyecto",
    type: "text",
    required: true,
  },
  {
    id: "emp_2",
    category: "Tu Empresa",
    question: "¿A qué industria o sector pertenece?",
    placeholder: "Ej: Moda, Tecnología, Gastronomía, Salud…",
    type: "text",
    required: true,
  },
  {
    id: "emp_3",
    category: "Tu Empresa",
    question: "¿Tienes un sitio web o redes sociales activas? Comparte los links.",
    placeholder: "https://tuempresa.com o @tuempresa",
    type: "url",
    required: false,
    hint: "Si tienes varios, puedes listarlos separados por comas.",
  },
  {
    id: "emp_4",
    category: "Tu Empresa",
    question: "¿Cuánto tiempo llevas en el mercado y cómo surgió la empresa?",
    placeholder: "Cuéntanos brevemente tu historia…",
    type: "textarea",
    required: false,
    hint: "No tiene que ser largo. Unos pocos párrafos bastan.",
  },

  // ── ADN de la Marca ──────────────────────────────────────────────
  {
    id: "adn_1",
    category: "ADN de la Marca",
    question: "¿Cuál es el propósito central del negocio?",
    placeholder: "Más allá de vender, ¿qué problema resuelven? ¿Por qué existen?",
    type: "textarea",
    required: true,
    hint: "Piensa en el impacto real que quieres generar en la vida de tus clientes.",
  },
  {
    id: "adn_2",
    category: "ADN de la Marca",
    question: "Si tu marca fuera una persona, ¿cómo hablaría y cómo se comportaría?",
    placeholder: "Ej: Técnica y seria, rebelde y joven, cercana y maternal, sofisticada y directa…",
    type: "textarea",
    required: true,
    hint: "Esto define la voz y personalidad de tu comunicación.",
  },
  {
    id: "adn_3",
    category: "ADN de la Marca",
    question: "¿Cuáles son los 3 valores innegociables de tu empresa?",
    placeholder: "Ej: Honestidad, Innovación, Calidad…",
    type: "textarea",
    required: true,
    hint: "Estos valores deben estar presentes en todo lo que diseñemos.",
  },

  // ── Mercado y Audiencia ──────────────────────────────────────────
  {
    id: "mkt_1",
    category: "Mercado y Audiencia",
    question: "¿Quién es tu cliente ideal?",
    placeholder: "No me digas 'todo el mundo'. Descríbeme a esa persona que paga sin quejarse y valora tu trabajo.",
    type: "textarea",
    required: true,
    hint: "Incluye edad, profesión, estilo de vida, miedos y aspiraciones si puedes.",
  },
  {
    id: "mkt_2",
    category: "Mercado y Audiencia",
    question: "¿Quién es tu competencia directa e indirecta?",
    placeholder: "¿A quién admiras de tu industria y de quién te quieres diferenciar?",
    type: "textarea",
    required: false,
    hint: "Puedes mencionar marcas locales, internacionales o de otros rubros que te inspiran.",
  },

  // ── Objetivos del Proyecto ────────────────────────────────────────
  {
    id: "obj_1",
    category: "Objetivos del Proyecto",
    question: "¿Qué quieres lograr con este proyecto?",
    placeholder: "Ej: Lanzar un producto nuevo, profesionalizar una imagen que se ve amateur, atraer un público con mayor poder adquisitivo…",
    type: "textarea",
    required: true,
  },
  {
    id: "obj_2",
    category: "Objetivos del Proyecto",
    question: "¿Cuál es el mayor problema o frustración visual que tienes hoy?",
    placeholder: "Ej: Mi logo no se lee en redes, mi empaque se ve barato, mi comunicación es un desorden…",
    type: "textarea",
    required: true,
    hint: "Ser honesto aquí nos ayuda a atacar el problema real, no el síntoma.",
  },
  {
    id: "obj_3",
    category: "Objetivos del Proyecto",
    question: "¿Tienes una fecha límite o plazo para este proyecto?",
    placeholder: "Ej: Para el 15 de mayo, en 6 semanas, para el lanzamiento en julio…",
    type: "text",
    required: false,
  },

  // ── Estética y Referencias ────────────────────────────────────────
  {
    id: "est_1",
    category: "Estética y Referencias",
    question: "¿Qué marcas (de cualquier rubro) te inspiran visualmente?",
    placeholder: "Pueden ser marcas locales, internacionales, de tu industria o de otras.",
    type: "textarea",
    required: false,
    hint: "No tienes que copiarlas, solo queremos entender qué estética te habla.",
  },
  {
    id: "est_2",
    category: "Estética y Referencias",
    question: "¿Qué colores, estilos o elementos visuales definitivamente NO quieres?",
    placeholder: "Ej: No quiero nada recargado, nada fluorescente, nada que parezca genérico…",
    type: "textarea",
    required: false,
    hint: "Los descartes son tan valiosos como las referencias positivas.",
  },
  {
    id: "est_3",
    category: "Estética y Referencias",
    question: "Sube imágenes, logos o referencias visuales que te inspiren",
    type: "file",
    required: false,
    hint: "Capturas de pantalla, fotos, PDFs, links de Pinterest o Behance. Todo suma.",
  },

  // ── Información Técnica ───────────────────────────────────────────
  {
    id: "tec_1",
    category: "Información Técnica",
    question: "¿En qué plataformas o formatos se usará el diseño?",
    placeholder: "Ej: Instagram, sitio web, impresión, packaging, presentaciones, señalética…",
    type: "textarea",
    required: false,
  },
  {
    id: "tec_2",
    category: "Información Técnica",
    question: "¿Tienes materiales existentes que debemos considerar o respetar?",
    placeholder: "Manual de marca, logo anterior, paleta ya definida, fotografías…",
    type: "file",
    required: false,
    hint: "Si tienes un logo actual o guía de estilo, súbelo aquí.",
  },
  {
    id: "tec_3",
    category: "Información Técnica",
    question: "¿Hay alguna restricción o condición especial que debamos saber?",
    placeholder: "Ej: Debe funcionar en blanco y negro, no puede usar ciertos colores por identidad corporativa…",
    type: "textarea",
    required: false,
  },
];

// Retorna las categorías únicas en el orden definido
export function getCategories(questions: BriefQuestion[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const q of questions) {
    if (!seen.has(q.category)) {
      seen.add(q.category);
      result.push(q.category);
    }
  }
  return result;
}
