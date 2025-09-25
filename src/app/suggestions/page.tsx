
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Send, Loader2, Trash2 } from "lucide-react";
import React, { useTransition } from 'react';
import { submitSuggestion } from "@/actions/suggestionActions";

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const suggestionFormSchema = z.object({
  category: z.enum(['bug', 'improvement', 'idea', 'interface'], {
    errorMap: () => ({ message: "Por favor, selecione uma categoria." })
  }),
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres.").max(100, "O título não pode ter mais de 100 caracteres."),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres.").max(2000, "A descrição não pode ter mais de 2000 caracteres."),
  screenshot: z.any()
    .optional()
    .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE_BYTES, `O arquivo não pode exceder ${MAX_FILE_SIZE_MB}MB.`)
    .refine((files) => !files || files.length === 0 || ['image/jpeg', 'image/png', 'image/gif'].includes(files[0].type), 'Apenas imagens (.jpg, .png, .gif) são permitidas.'),
});

type SuggestionFormData = z.infer<typeof suggestionFormSchema>;

export default function SuggestionsPage() {
  const { toast } = useToast();
  const [screenshotPreview, setScreenshotPreview] = React.useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      category: 'improvement',
      title: '',
      description: '',
      screenshot: undefined,
    },
  });

  const onSubmit = (data: SuggestionFormData) => {
    startTransition(async () => {
      let screenshotInfo;
      const file = data.screenshot?.[0];
      if (file) {
        screenshotInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
        };
      }

      const { screenshot, ...formData } = data;
      const result = await submitSuggestion({ ...formData, screenshotInfo });

      if (result.success) {
        toast({
          title: "Sugestão Enviada com Sucesso!",
          description: result.message,
        });
        reset();
        setScreenshotPreview(null);
      } else {
        toast({
          title: "Erro ao Enviar",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Lightbulb className="h-8 w-8 text-primary" />
            Envie sua Sugestão ou Reporte um Problema
          </CardTitle>
          <CardDescription>
            Sua opinião é fundamental para a evolução do DocFlow. Use este espaço para nos contar suas ideias, sugerir melhorias ou reportar bugs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="improvement">Sugestão de Melhoria</SelectItem>
                      <SelectItem value="idea">Nova Ideia/Funcionalidade</SelectItem>
                      <SelectItem value="bug">Reportar um Bug/Problema</SelectItem>
                      <SelectItem value="interface">Feedback de Interface/Usabilidade</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label htmlFor="title">Título *</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => <Input id="title" placeholder="Um resumo breve da sua sugestão" {...field} />}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Descrição Detalhada *</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Descreva sua sugestão em detalhes. Se for um bug, por favor, inclua os passos para reproduzi-lo."
                    rows={8}
                    {...field}
                  />
                )}
              />
              {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="screenshot">Anexar Captura de Tela (Opcional)</Label>
              <Controller
                name="screenshot"
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    {...fieldProps}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setScreenshotPreview(previewUrl);
                        onChange(e.target.files);
                      } else {
                        setScreenshotPreview(null);
                        onChange(null);
                      }
                    }}
                  />
                )}
              />
              {errors.screenshot && <p className="text-sm text-destructive mt-1">{errors.screenshot.message as string}</p>}
            </div>

            {screenshotPreview && (
              <div className="mt-4 relative">
                <p className="text-sm font-medium mb-2">Pré-visualização:</p>
                <div className="relative w-full h-auto max-w-sm border rounded-md p-2 bg-muted/50">
                  <img src={screenshotPreview} alt="Pré-visualização da captura de tela" className="rounded-md max-h-64 w-auto object-contain" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => {
                      setScreenshotPreview(null);
                      setValue('screenshot', null, { shouldValidate: true });
                      const fileInput = document.getElementById('screenshot') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Enviar Sugestão
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
