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
            router.push(`/meeting-minutes/${result.data.id}/edit`);
          } else {
            toast({
              title: "Erro na Geração",
              description: result.message || "Não foi possível gerar a ata de reunião.",
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
                {contracts.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio-upload">Arquivo de Áudio *</Label>
            <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} />
            <p className="text-sm text-muted-foreground">Formatos suportados: MP3, WAV, M4A, OGG.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleGenerateAndSave} disabled={!audioFile || !selectedContractId || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isLoading ? 'Gerando e Salvando...' : 'Gerar e Salvar Rascunho'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          A transcrição e sumarização são realizadas com IA. Revise o conteúdo antes de finalizar.
        </CardFooter>
      </Card>
    </div>
  );
}