import { 
  PartyPopper, Sun, Lightbulb, Cloud, 
  ShieldAlert, ThumbsDown, AlertCircle, Frown, Smile,
  Heart, Moon, User,
  LucideIcon 
} from 'lucide-react';

export interface Mood {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  text: string;
  light: string;
}

export interface JournalEntry {
  id: number;
  mood: string;
  prompt: string;
  text: string;
  date: string;
}

export const WISDOM_SEEDS = [
  "A clareza não nasce do pensamento, mas do silêncio que o precede.",
  "Honrar o que se sente é o primeiro passo para transformar o que se vive.",
  "Às vezes, a resposta mais sábia é a pergunta que você ainda não se fez.",
  "O que pesa hoje é apenas o que você ainda não aprendeu a soltar.",
  "Sua sensibilidade não é uma fraqueza, é a bússola que guia sua verdade.",
  "Não apresse o desabrochar; até as sombras precisam de tempo para se mover.",
  "A paz que você procura está escondida atrás da aceitação do caos atual.",
  "Você não precisa de um mapa inteiro, apenas de luz suficiente para o próximo passo.",
  "Onde há desconforto, há uma fronteira da sua alma querendo se expandir.",
  "Respire. O mundo pode esperar enquanto você se reencontra.",
  "Sua jornada é única; não compare o seu inverno com a primavera alheia.",
  "A intuição fala baixo; é preciso silenciar o ruído para ouvir o mestre interno.",
  "Tudo o que você resiste, persiste. O que você aceita, se transforma.",
  "A coragem não é a ausência de medo, mas a decisão de que algo é mais importante.",
  "Seu coração sabe o caminho, mesmo quando sua mente se perde na neblina.",
  "Cada emoção é um mensageiro. O que a mensagem de hoje está tentando dizer?",
  "O descanso é o solo onde a criatividade e a cura criam raízes.",
  "Seja gentil com suas versões que ainda estão aprendendo a caminhar.",
  "A vida acontece nos intervalos entre o que planejamos e o que permitimos.",
  "Sua luz não diminui ao iluminar as sombras dos outros, mas se fortalece.",
  "O silêncio não é vazio; ele está cheio de respostas esperando o momento certo.",
  "Confie no ritmo da sua própria vida. Há um tempo para plantar e um tempo para colher.",
  "A maior liberdade é poder ser quem você é, sem pedir licença ao mundo.",
  "O que você busca também está buscando você. Mantenha o coração aberto.",
  "A vulnerabilidade é a fenda por onde a luz da conexão entra.",
  "Não se perca no que poderia ter sido; a força está no que é agora.",
  "Sua energia é o seu bem mais precioso. Onde você a está investindo hoje?",
  "A sabedoria é saber quando agir e quando simplesmente observar o fluxo.",
  "Você é o céu; as emoções são apenas o clima que passa por ele.",
  "Pequenas sementes de intenção criam florestas de mudança.",
  "O que você sente é real, mas não define a totalidade de quem você é.",
  "A cura é um processo em espiral; às vezes parece que voltamos, mas estamos mais profundos.",
  "Dê a si mesmo o crédito por ter chegado até aqui, apesar de tudo.",
  "A beleza da vida está na imperfeição que nos torna humanos e únicos.",
  "Sua intuição é a voz da sua alma sussurrando a verdade.",
  "O caos de hoje é o adubo para a sabedoria de amanhã.",
  "Não tente controlar o vento, apenas ajuste as velas da sua presença.",
  "A gratidão transforma o que temos em suficiente.",
  "Você é o autor da sua narrativa; que palavra você quer escrever a seguir?",
  "Onde houver sombra, lembre-se de que há uma luz por perto projetando-a."
];

export const MOODS: Mood[] = [
  { id: 'feliz', label: 'Felicidade', icon: PartyPopper, color: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-50' },
  { id: 'tranquilo', label: 'Tranquilidade', icon: Sun, color: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' },
  { id: 'inspirado', label: 'Inspiração', icon: Lightbulb, color: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-50' },
  { id: 'ansioso', label: 'Ansiedade', icon: Cloud, color: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' },
  { id: 'preocupado', label: 'Preocupação', icon: ShieldAlert, color: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50' },
  { id: 'decepcionado', label: 'Decepção', icon: ThumbsDown, color: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50' },
  { id: 'irritado', label: 'Irritação', icon: AlertCircle, color: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-50' },
  { id: 'triste', label: 'Tristeza', icon: Frown, color: 'bg-slate-400', text: 'text-slate-400', light: 'bg-slate-100' },
  { id: 'reflexivo', label: 'Dúvida', icon: Smile, color: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-50' },
  { id: 'gratidao', label: 'Gratidão', icon: Heart, color: 'bg-rose-400', text: 'text-rose-400', light: 'bg-rose-50' },
  { id: 'cansaco', label: 'Cansaço', icon: Moon, color: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-100' },
  { id: 'solidao', label: 'Solidão', icon: User, color: 'bg-cyan-600', text: 'text-cyan-600', light: 'bg-cyan-50' }
];

export const PROMPTS: Record<string, string[]> = {
  ansioso: ["O que está sob meu controlo agora?", "Se eu pudesse adiar esta dúvida, o que faria?", "Que sensação física sinto agora?", "O que o meu eu futuro diria disto?", "Para onde este vento me sopra?"],
  triste: ["Qual foi a minha pequena vitória hoje?", "O que esta dor me quer dizer?", "Qual seria o gesto mais gentil para comigo?", "Se eu abraçasse a dor, o que ouviria?", "Que 3 coisas ainda têm cor?"],
  reflexivo: ["Que padrão notei em mim esta semana?", "Qual o título do meu capítulo atual?", "O que diria à minha versão de há 5 anos?", "Que silêncio precisa de palavras?", "Se eu não tivesse de agradar a ninguém, o que faria?"],
  irritado: ["Isto é sobre agora ou é acumulado?", "Que pequeno ajuste me daria alívio?", "O que estou a tentar apressar?", "Se soltasse um peso agora, qual seria?", "Como expressar isto para ser ouvido?"],
  preocupado: ["Isto é cuidado ou hábito de medo?", "Que provas reais tenho do pior cenário?", "E se eu soubesse que posso não falhar?", "Qual o primeiro passo para resolver isto?", "O que ganho em manter este pensamento?"],
  tranquilo: ["Como levar esta paz para o resto do dia?", "O que me permitiu sentir assim?", "Que semente de gratidão floresce aqui?", "A quem enviaria um pensamento de paz?", "Como a minha paz afeta os outros?"],
  decepcionado: ["O que isto revela das minhas expectativas?", "Que lição está aqui escondida?", "Como ser mais honesto sobre o ocorrido?", "Se eu perdoasse, o que mudaria?", "Como reconstruir o caminho agora?"],
  feliz: ["Qual a cor desta felicidade?", "Como partilhar este brilho?", "O que fiz de diferente para chegar aqui?", "Que detalhe me fez sorrir hoje?", "Que legenda daria a este momento?"],
  inspirado: ["Que ideia nova me visitou hoje?", "Qual é o primeiro passo para tornar isto real?", "A quem este pensamento poderia ajudar?", "O que me fez sentir que tudo é possível?", "Que música ou imagem combina com este estado?"],
  gratidao: ["Que detalhe invisível do meu dia merece um 'obrigado'?", "Quem foi a pessoa que, mesmo sem saber, melhorou o meu dia?", "O que eu tenho hoje que era um desejo de ontem?", "Qual é a sensação física que a gratidão traz ao meu corpo agora?", "Se eu pudesse agradecer por um desafio, qual seria?"],
  cansaco: ["Este cansaço é do corpo, da mente ou da alma?", "O que eu posso deixar de fazer hoje para me dar um momento de pausa?", "Qual é o limite que eu ignorei e que me trouxe até aqui?", "Se o descanso fosse um lugar, como ele seria?", "O que me roubou mais energia nas últimas horas?"],
  solidao: ["O que este silêncio está a tentar dizer-me?", "Sinto falta de alguém ou sinto falta de mim mesmo?", "Como posso ser a minha própria melhor companhia hoje?", "Que parte de mim só se revela quando estou sozinho?", "A solidão é um vazio ou um espaço para eu crescer?"]
};
