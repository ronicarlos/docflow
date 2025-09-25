
'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as analysisResultService from '@/services/analysisResultService';
import { intelligentAnalysisFlow } from '@/flows/intelligent-analysis-flow';
import { revalidatePath } from 'next/cache';
import type { AnalysisResult } from '@/types';
import { ExecuteAnalysisSchema, UpdateAnalysisSchema } from '@/types/AnalysisResult';
import type { ExecuteAnalysisInput, UpdateAnalysisInput } from '@/types/AnalysisResult';


export async function executeContractAnalysis(
  input: ExecuteAnalysisInput
): Promise<{ success: boolean; message: string; data?: AnalysisResult }> {
  try {
    const validatedInput = ExecuteAnalysisSchema.parse(input);
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      redirect('/login');
    }

    // Verificar permissões - apenas Admin e SuperAdmin podem executar análises
    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      return { success: false, message: "Você não tem permissão para executar análises de contrato." };
    }

    // 1. Fetch Contract and its settings
    const contract = await ContractDrizzleService.findById(validatedInput.contractId, currentUser.tenantId);
    if (!contract) throw new Error("Contrato principal não encontrado.");

    // Note: We no longer fetch evidence documents here.
    // The AI flow will do it using the provided tool.

    // 2. Create an initial "processing" record for the analysis
    const initialResultData: Partial<AnalysisResult> = {
        tenantId: currentUser.tenantId,
        contractId: contract.id,
        executedBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
        parameters: { dateFilterType: validatedInput.dateFilterType, dateRange: validatedInput.dateRange },
        status: 'processing',
        summary: 'Análise em andamento...',
        conformityPoints: [],
        deviations: [],
        triggeredAlerts: [],
    };
    const analysisRecord = await analysisResultService.create(initialResultData);

    // 3. Execute the AI flow asynchronously. The flow now only needs the contract.
    try {
        const aiResult = await intelligentAnalysisFlow({ 
            contract: contract, 
            dateRange: validatedInput.dateRange 
        });

        // 4. Update the record with the AI's results
        const finalResult = await analysisResultService.update(analysisRecord.id, {
            ...aiResult,
            status: 'completed',
            completedAt: new Date().toISOString(),
        });
        
        revalidatePath(`/contracts`); // To refresh the history in the modal
        return { success: true, message: 'Análise concluída com sucesso.', data: finalResult! };

    } catch (aiError: any) {
        // If AI fails, update the record to 'failed'
        await analysisResultService.update(analysisRecord.id, {
            status: 'failed',
            errorDetails: aiError.message || 'Erro desconhecido no fluxo de IA.',
            completedAt: new Date().toISOString(),
        });
        throw aiError; // re-throw to be caught by the outer catch
    }

  } catch (error: any) {
    console.error("Erro na execução da análise de contrato:", error);
    // Agora a mensagem de erro será a mensagem detalhada vinda do serviço.
    return { success: false, message: error.message || "Falha ao executar a análise." };
  }
}

export async function updateAnalysisResult(
  analysisId: string, 
  data: UpdateAnalysisInput
): Promise<{ success: boolean; message: string; }> {
    try {
        const validatedData = UpdateAnalysisSchema.parse(data);
        await analysisResultService.update(analysisId, validatedData);
        revalidatePath(`/contracts`);
        return { success: true, message: 'Resultado da análise salvo com sucesso.' };
    } catch(error: any) {
        console.error("Erro ao atualizar resultado da análise:", error);
        return { success: false, message: error.message || "Falha ao salvar." };
    }
}