"use client";

import { useState, type FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AudioLines, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMeetingMinuteFromAudio } from '@/actions/meetingMinuteActions';
import { useToast } from '@/hooks/use-toast';
import type { Contract, User } from '@/types';
import { useRouter } from 'next/navigation';

interface AudioMemoFormProps {
  contracts: Contract[];
  currentUser?: User;
}

export const AudioMemoForm: FC<AudioMemoFormProps> = ({ contracts, currentUser }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Arquivo Inválido",
          description: "Por favor, selecione um arquivo de áudio (ex: MP3, WAV, M4A, OGG).",
          variant: "destructive",
        });
        setAudioFile(null);
        event.target.value = '';
        return;
      }
      setAudioFile(file);
    }
  };

  const handleGenerateAndSave = async () => {
    if (!audioFile || !selectedContractId) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const mimeType = audioFile.type;
          const audioDataUri = `data:${mimeType};base64,${base64String}`;

          const result = await createMeetingMinuteFromAudio({
            audioDataUri,
            contractId: selectedContractId,
          });

          if (result.success && result.data) {
            toast({
              title: "Ata Gerada com Sucesso!",
              description: "A ata de reunião foi criada e salva como rascunho.",
            });
            router.push(`/meeting-minutes/${result.data._id}/edit`);
          } else {
            toast({
              title: "Erro na Geração",
              description: result.error || "Não foi possível gerar a ata de reunião.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erro no processamento:", error);
          toast({
            title: "Erro no Processamento",
            description: "Ocorreu um erro ao processar o arquivo de áudio.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = (error) => {
        setIsLoading(false);
        throw new Error("Falha ao ler o arquivo de áudio.");
      };
      reader.readAsArrayBuffer(audioFile);
    } catch (error) {
      console.error("Erro no processo de upload:", error);
      toast({ 
        title: "Falha no Upload", 
        description: "Não foi possível carregar o arquivo. Por favor, tente novamente.", 
        variant: "destructive" 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AudioLines className="h-7 w-7 text-primary" />
            Gerar Nova Ata de Reunião
          </CardTitle>
          <CardDescription>
            Selecione um contrato, faça upload de um arquivo de áudio e a IA irá gerar um rascunho de ata de reunião.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contract-select">Contrato Associado *</Label>
            <Select onValueChange={setSelectedContractId} value={selectedContractId} disabled={contracts.length === 0}>
              <SelectTrigger id="contract-select">
                <SelectValue placeholder={contracts.length === 0 ? "Nenhum contrato acessível" : "Selecione o contrato"} />
              </SelectTrigger>
              <SelectContent>
                {contracts.map(contract => (
                  <SelectItem key={contract.id} value={contract.id}>{contract.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="audio-upload">Arquivo de Áudio (.mp3, .wav, .m4a, .ogg) *</Label>
            <Label
              htmlFor="audio-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/70 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                <p className="mb-2 text-sm text-foreground">
                  <span className="font-semibold">Clique para carregar</span> ou arraste e solte
                </p>
              </div>
              <Input
                id="audio-upload"
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </Label>
            {audioFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Arquivo: <span className="font-medium text-foreground">{audioFile.name}</span>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateAndSave} disabled={isLoading || !audioFile || !selectedContractId} className="w-full text-base py-6">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <AudioLines className="mr-2 h-5 w-5" />
            )}
            Gerar e Salvar Rascunho da Ata
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};