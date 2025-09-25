
"use client";

import * as React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface SpeechToTextButtonProps {
  onTranscript: (transcript: string) => void;
  onFinalTranscript: (transcript: string) => void;
  targetId: string;
  className?: string;
  disabled?: boolean;
}

export default function SpeechToTextButton({ onTranscript, onFinalTranscript, targetId, className, disabled }: SpeechToTextButtonProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState(false);
  const recognitionRef = React.useRef<any | null>(null);

  React.useEffect(() => {
    // A API só está disponível no cliente
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';
      setIsAvailable(true);

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        onTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        if(isListening) { // Auto-restart if it was intentionally listening
           recognitionRef.current?.start();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Erro no Reconhecimento de Voz",
          description: `Ocorreu um erro: ${event.error}. Tente novamente.`,
          variant: "destructive"
        });
        setIsListening(false);
      };
    } else {
      setIsAvailable(false);
    }
  }, [onTranscript, toast, isListening]);
  

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      onFinalTranscript(''); // Sinaliza o fim e permite a consolidação do texto
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
         console.error("Could not start speech recognition", e);
          toast({
            title: "Não foi possível iniciar a gravação",
            description: "Verifique se o microfone está conectado e se o navegador tem permissão para usá-lo.",
            variant: "destructive"
        });
      }
    }
  };

  if (!isAvailable) {
    return null; // O componente não renderiza se a API não estiver disponível
  }

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleToggleListening}
                    className={cn(
                        "transition-all",
                        isListening && "bg-destructive/20 text-destructive border-destructive/50",
                        className
                    )}
                    aria-label={isListening ? "Parar de ouvir" : "Começar a ouvir"}
                    disabled={disabled}
                >
                    {isListening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isListening ? "Parar ditado (o texto será finalizado)" : "Começar a ditar (Protocolo Ouvir Usuário)"}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
