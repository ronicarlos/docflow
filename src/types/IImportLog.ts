export interface IImportLog {
    tenantId: Schema.Types.ObjectId;
    contractId: Schema.Types.ObjectId;
    usuarioId: Schema.Types.ObjectId;
    documentId?: Schema.Types.ObjectId;
    documentCode?: string;
    documentRevision?: string;
    totalImportados?: number;
    totalFalhas?: number;
    listaErros?: Array<{ 
        linha?: number; 
        erro: string;
        mensagem: string;
        userId?: Schema.Types.ObjectId;
    }>;
}