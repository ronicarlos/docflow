

'use server';
import * as documentService from '@/services/documentService';
import { getCurrentUser } from '@/lib/auth';
import { findTenantById } from '@/services/tenantService';
import type { User, ITenant, Document } from '@/types';
import DocumentTreeViewClient from '@/components/document/document-tree-view-client';
import { redirect } from 'next/navigation';
import { UserRole } from '@/lib/constants';

export default async function DocumentTreeViewPage() {
    const user = await getCurrentUser();
    
    if (!user) {
        redirect('/login');
    }

    const tenantDetails = await findTenantById(user.tenantId);
    
    if (!tenantDetails) {
        redirect('/login');
    }

    const documents = await documentService.findAll(tenantDetails.tenantId);
    
    // Server-side filtering based on user permissions
    let accessibleDocuments = documents;
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
        if (user.accessibleContractIds && user.accessibleContractIds.length > 0) {
            accessibleDocuments = documents.filter(doc => {
                const contractId = typeof doc.contract === 'string' ? doc.contract : doc.contract.id;
                return user.accessibleContractIds!.includes(contractId);
            });
        } else {
            accessibleDocuments = []; // No contracts assigned, no documents visible
        }
    }

    return (
        <DocumentTreeViewClient 
            initialDocuments={accessibleDocuments} 
            currentTenant={tenantDetails ? {tenantId: tenantDetails.tenantId, name: tenantDetails.name} : undefined} 
        />
    );
}
