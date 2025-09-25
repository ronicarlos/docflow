
"use client";

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
// REMOVED server-only imports
// import { helpChat } from '@/flows/help-chat';
// import { textToSpeech } from '@/flows/text-to-speech';
import { cn } from '@/lib/utils';
import { Bot, DownloadCloud, FileAudio, FileImage, FileText, HelpCircle, History, Loader2, Mic, Paperclip, Send, Square, User, X } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/use-auth';
import { useAiAssistant } from '@/hooks/use-ai-assistant';
import type { IAiAssistantMessage as Message } from '@/types';
import type { AiAssistantMessage } from '@prisma/client';

// Helper API callers to server routes
async function callHelpChat(input: any): Promise<{ answer: string }> {
  const res = await fetch('/api/ai/help-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let msg = 'Falha ao chamar o assistente de ajuda.';
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function callTextToSpeech(input: { text: string }): Promise<{ audioDataUri: string }> {
  const res = await fetch('/api/ai/text-to-speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let msg = 'Falha ao gerar áudio.';
    try { msg = (await res.json()).error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}


const ALLOWED_FILE_TYPES = ['image/', 'audio/', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const AssistantAvatar = () => (
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-primary/20">
        <Bot className="w-6 h-6 text-primary" />
    </div>
);


const AiAssistant: React.FC = () => {
  const { toast } = useToast();
  const pathname = usePathname();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const { history, isLoading: isHistoryLoading, saveMessage } = useAiAssistant(currentUser?.tenantId || null);
  
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  
  const [isRecording, setIsRecording] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isPopoverOpen && isMounted) {
      // Reset messages when popover opens
      setMessages([]);
      setIsHistoryVisible(false);
    }
  }, [isPopoverOpen, isMounted]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(scrollToBottom, [messages, isHistoryVisible]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isAllowed = ALLOWED_FILE_TYPES.some(type => file.type.startsWith(type));
      if (!isAllowed) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Por favor, selecione um arquivo de imagem, áudio, PDF ou texto.",
          variant: "destructive",
        });
        return;
      }

      setAttachment(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null); // No preview for non-image files
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getAttachmentType = (file: File | null): 'image' | 'audio' | 'document' | undefined => {
      if (!file) return undefined;
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('audio/')) return 'audio';
      return 'document';
  };

  const handleStartRecording = async () => {
    removeAttachment();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const audioChunks: Blob[] = [];

        recorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        recorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
          setAttachment(audioFile);
          stream.getTracks().forEach(track => track.stop());
        });
        
        recorder.start();

      } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
          title: "Microfone não acessível",
          description: "Por favor, permita o acesso ao microfone no seu navegador para usar esta funcionalidade.",
          variant: "destructive",
        });
        setIsRecording(false);
      }
    } else {
      toast({
        title: "Funcionalidade não suportada",
        description: "Seu navegador não suporta gravação de áudio.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const prepareAttachmentData = async (file: File | null, type: 'image' | 'audio' | 'document' | undefined) => {
    let imageDataUri: string | undefined = undefined;
    let audioDataUri: string | undefined = undefined;
    let documentDataUri: string | undefined = undefined;

    if (file) {
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        if (type === 'image') imageDataUri = dataUri;
        else if (type === 'audio') audioDataUri = dataUri;
        else documentDataUri = dataUri;
    }

    return { imageDataUri, audioDataUri, documentDataUri };
  }


  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading || (!input.trim() && !attachment)) return;

    const question = input;
    const attachedFile = attachment;
    const attachmentType = getAttachmentType(attachedFile);

    if (!currentUser) {
        toast({ title: "Erro de usuário", description: "Não foi possível identificar o usuário logado.", variant: "destructive" });
        return;
    }

    const userMessage: Message = {
      _id: uuidv4(),
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      timestamp: new Date(),
      message: question || (attachedFile ? `Analisar o arquivo: ${attachedFile.name}` : ''),
      sender: 'user',
      attachmentPreview: attachmentType === 'image' ? attachmentPreview || undefined : undefined,
      attachmentType: attachmentType,
      attachmentName: attachedFile?.name,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    removeAttachment();
    setIsLoading(true);

    let aiMessage: Message;

    try {
      const { imageDataUri, audioDataUri, documentDataUri } = await prepareAttachmentData(attachedFile, attachmentType);
      
      const textResponse = await callHelpChat({ 
        question, 
        pageContext: pathname,
        imageDataUri,
        audioDataUri,
        documentDataUri,
        tenantId: currentUser.tenantId,
      });
      
      aiMessage = { 
        _id: uuidv4(), 
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
        timestamp: new Date(),
        message: textResponse.answer, 
        sender: 'ai',
        isGeneratingAudio: false,
        hasAudio: false, // Start without audio
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      
      // Save to database using the real service
      await saveMessage(question, textResponse.answer, pathname);

      // Generate audio in the background
      callTextToSpeech({ text: textResponse.answer })
        .then(audioResponse => {
            const updateMessagesWithAudio = (msgs: Message[]) => msgs.map(msg => 
              msg._id === aiMessage._id ? { ...msg, hasAudio: true, audioDataUri: audioResponse.audioDataUri, isGeneratingAudio: false } : msg
            );
            setMessages(updateMessagesWithAudio);
          })
        .catch(err => {
            console.error('Falha ao gerar áudio:', err);
            const updateMessagesGeneratingError = (msgs: Message[]) => msgs.map(msg => 
              msg._id === aiMessage._id ? { ...msg, isGeneratingAudio: false } : msg
            );
            setMessages(updateMessagesGeneratingError);
          });

    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao enviar mensagem', description: error instanceof Error ? error.message : 'Erro desconhecido', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const handleOpenAssistant = () => setIsPopoverOpen(true);
    window.addEventListener('open-ai-assistant', handleOpenAssistant);
    return () => window.removeEventListener('open-ai-assistant', handleOpenAssistant);
  }, []);
  
  const getAttachmentIcon = (file: File | null) => {
    if (!file) return <Paperclip className="h-4 w-4 text-muted-foreground" />;
    if (file.type.startsWith("image/")) {
        return <FileImage className="h-5 w-5 text-muted-foreground" />;
    }
    if (file.type.startsWith("audio/")) {
        return <FileAudio className="h-5 w-5 text-muted-foreground" />;
    }
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };
  
  const renderMessage = (message: Message, isHistory: boolean) => (
      <div key={message._id} className={cn("flex items-start gap-3", message.sender === 'user' ? "justify-end" : "justify-start")}>
        {message.sender === 'ai' && <AssistantAvatar />}
        <div className={cn(
          "max-w-xs md:max-w-sm rounded-lg px-4 py-2 text-sm relative",
          message.sender === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          isHistory && "opacity-90"
        )}>
          {message.attachmentType === 'image' && message.attachmentPreview && (
            <Image src={message.attachmentPreview} alt="Anexo do usuário" width={200} height={150} className="rounded-md mb-2" />
          )}
          {message.attachmentType === 'audio' && (
            <div className="bg-primary/10 p-2 rounded-md mb-2 text-primary-foreground flex items-center gap-2">
                <FileAudio className="h-4 w-4"/>
                <p className="text-xs">{message.attachmentName || 'Áudio anexado'}</p>
            </div>
          )}
          {message.attachmentType === 'document' && (
            <div className="bg-primary/10 p-2 rounded-md mb-2 text-primary-foreground flex items-center gap-2">
                <FileText className="h-4 w-4"/>
                <p className="text-xs">{message.attachmentName || 'Documento anexado'}</p>
            </div>
          )}
          {message.message && <p className="whitespace-pre-wrap">{message.message}</p>}

          {message.sender === 'ai' && message.hasAudio && (
            <div className="absolute -top-1 -right-1">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </div>
            </div>
          )}
        </div>
        {message.sender === 'user' && <div className="p-2 bg-muted rounded-full"><User className="h-5 w-5 text-muted-foreground" /></div>}
      </div>
  );

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center animate-in fade-in zoom-in-95"
          aria-label="Abrir Assistente de IA"
        >
          <HelpCircle className="h-7 w-7" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-[90vw] max-w-md h-[70vh] max-h-[600px] p-0 flex flex-col mr-2 mb-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <Bot className="h-5 w-5" />
            Assistente {APP_NAME}
            {isRecording && (
                <span className="flex items-center gap-1.5 text-xs text-red-500 animate-pulse">
                    <Mic className="h-3 w-3" />
                    Gravando...
                </span>
            )}
          </h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsPopoverOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </header>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className={cn("flex items-start gap-3 justify-start")}>
                <AssistantAvatar />
                <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 text-sm">
                    <p>Olá! Sou seu assistente de IA. Envie uma imagem, áudio ou texto. Como posso ajudar a garantir a conformidade com a ISO 9001 hoje?</p>
                </div>
            </div>
            
            {history.length > 0 && (
                 <Accordion type="single" collapsible onValueChange={(value) => setIsHistoryVisible(!!value)}>
                  <AccordionItem value="history" className="border-none">
                    <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:no-underline justify-center py-1">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        {isHistoryVisible ? "Ocultar Histórico" : "Mostrar Histórico"}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                        {history.map(msg => {
                          // Convert PostgreSQL message to Message format
                          const convertedMsg: Message = {
                            _id: msg.id,
                            tenantId: msg.tenantId,
                            userId: '', // AiAssistantMessage doesn't have userId field
                            timestamp: msg.createdAt,
                            message: msg.question,
                            sender: 'user',
                          };
                          const aiResponse: Message = {
                            _id: `${msg.id}_ai`,
                            tenantId: msg.tenantId,
                            userId: '', // AiAssistantMessage doesn't have userId field
                            timestamp: msg.createdAt,
                            message: msg.answer,
                            sender: 'ai',
                            hasAudio: false,
                          };
                          return (
                            <div key={msg.id} className="space-y-2">
                              {renderMessage(convertedMsg, true)}
                              {renderMessage(aiResponse, true)}
                            </div>
                          );
                        })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            )}

            {messages.map(msg => renderMessage(msg, false))}

            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border animate-pulse">
                  <Bot className="w-6 h-6 text-primary/50"/>
                </div>
                <div className="bg-muted text-muted-foreground rounded-lg px-4 py-3 text-sm">
                  Pensando...
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        {attachment && (
          <div className="p-2 border-t text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              {attachmentPreview ? (
                <Image src={attachmentPreview} alt="Preview" width={32} height={32} className="rounded object-cover" />
              ) : (
                getAttachmentIcon(attachment)
              )}
              <span className="truncate text-muted-foreground text-xs">{attachment.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeAttachment}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            id="ai-attachment"
            className="hidden"
            accept={ALLOWED_FILE_TYPES.map(t => t.startsWith('.') ? t : t+'*').join(',')}
            onChange={handleFileChange}
          />
          <Button asChild variant="ghost" size="icon" aria-label="Anexar arquivo" type="button">
            <label htmlFor="ai-attachment" className="cursor-pointer">
              <Paperclip className="h-4 w-4" />
            </label>
          </Button>
          <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
              disabled={isLoading}
          >
              {isRecording ? (
                  <Square className="h-5 w-5 text-red-500" />
              ) : (
                  <Mic className="h-5 w-5" />
              )}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ou descreva..."
            disabled={isLoading || isRecording}
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || (!input.trim() && !attachment)} size="icon" aria-label="Enviar mensagem">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default AiAssistant;
