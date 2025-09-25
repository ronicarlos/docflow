
"use client";

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Discipline, Contract } from "@/types";
import { Network, Save, UserCheck, Users, Search, Group, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDistributionRules, saveDistributionRules } from '@/actions/distributionRuleActions';
import type { IDistributionRule } from '@/types/IDistributionRule';

interface DistributionRulesClientProps {
    initialUsers: User[];
    initialDisciplines: Discipline[];
    initialContracts: Contract[];
}

export default function DistributionRulesClient({ initialUsers, initialDisciplines, initialContracts }: DistributionRulesClientProps) {
  const { toast } = useToast();
  const [isSaving, startSaving] = useTransition();
  const [isLoadingRules, startLoadingRules] = useTransition();

  const [users] = useState<User[]>(initialUsers);
  const [disciplines] = useState<Discipline[]>(initialDisciplines);
  const [contracts] = useState<Contract[]>(initialContracts);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  
  const [distributionRulesState, setDistributionRulesState] = useState<Record<string, string[]>>({});
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const disciplineNames = useMemo(() => disciplines.map(d => d.name).sort((a,b) => a.localeCompare(b)), [disciplines]);

  useEffect(() => {
    if (selectedContractId) {
      startLoadingRules(async () => {
        const rulesData = await getDistributionRules(selectedContractId);
        const rulesMap: Record<string, string[]> = {};
        users.forEach(user => {
            const userRule = rulesData.find(rule => rule.userId.toString() === user.id.toString());
            rulesMap[user.id] = userRule ? userRule.areas : [];
        });
        setDistributionRulesState(rulesMap);
      });
    } else {
      setDistributionRulesState({});
    }
  }, [selectedContractId, users]);

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  const handleAreaChangeForUser = (userId: string, areaName: string, checked: boolean | string) => {
    setDistributionRulesState(prevRules => {
      const userAreas = prevRules[userId] ? [...prevRules[userId]] : [];
      if (checked) {
        if (!userAreas.includes(areaName)) userAreas.push(areaName);
      } else {
        const index = userAreas.indexOf(areaName);
        if (index > -1) userAreas.splice(index, 1);
      }
      return { ...prevRules, [userId]: userAreas };
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedContractId) {
      toast({ title: "Nenhum Contrato Selecionado", description: "Selecione um contrato para salvar as regras.", variant: "destructive" });
      return;
    }
    startSaving(async () => {
      const result = await saveDistributionRules(selectedContractId, distributionRulesState);
      if (result.success) {
        toast({
          title: "Regras Salvas!",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro ao Salvar",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Network className="w-7 h-7 text-primary" />
            Gerenciar Regras de Distribuição
          </CardTitle>
          <CardDescription>
            Defina quais usuários recebem notificações para documentos de cada área, por contrato.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
              <Label htmlFor="contract-select" className="text-base font-semibold">1. Selecione um Contrato *</Label>
              <Select onValueChange={setSelectedContractId} value={selectedContractId}>
                <SelectTrigger id="contract-select" className="mt-1">
                  <SelectValue placeholder="Escolha um contrato para gerenciar suas regras..." />
                </SelectTrigger>
                <SelectContent>
                    {contracts.map(contract => (
                        <SelectItem key={contract.id} value={contract.id}>{contract.name} ({contract.internalCode})</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className={`transition-opacity duration-500 ${!selectedContractId || isLoadingRules ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <Label htmlFor="user-search" className="text-base font-semibold">2. Atribua Áreas aos Usuários</Label>
                <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="user-search" placeholder="Buscar usuário por nome ou email..." className="pl-8" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} />
                </div>
                 {isLoadingRules && (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando regras...
                    </div>
                )}
                {!isLoadingRules && selectedContractId && (
                  <ScrollArea className="h-[calc(100vh-500px)] pr-3 mt-4">
                    <div className="space-y-4">
                        {filteredUsers.map(user => (
                            <Card key={user.id} className="bg-card/50 p-4">
                                <Label className="font-semibold flex items-center gap-2 text-md">
                                    <UserCheck className="h-5 w-5 text-primary" /> {user.name} <span className="text-sm text-muted-foreground">({user.area})</span>
                                </Label>
                                <div className="p-2 mt-2 border rounded-md">
                                    <ScrollArea className="h-32">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-1">
                                            {disciplineNames.map(areaName => (
                                                <div key={`${user.id}-${areaName}`} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${user.id}-${areaName.replace(/\s+/g, '_')}`}
                                                        checked={distributionRulesState[user.id]?.includes(areaName) || false}
                                                        onCheckedChange={(checked) => handleAreaChangeForUser(user.id, areaName, checked)}
                                                    />
                                                    <Label htmlFor={`${user.id}-${areaName.replace(/\s+/g, '_')}`} className="text-sm font-normal cursor-pointer">{areaName}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </Card>
                        ))}
                    </div>
                  </ScrollArea>
                )}
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
             <Button onClick={handleSaveChanges} size="lg" disabled={isSaving || !selectedContractId || isLoadingRules}>
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? 'Salvando...' : 'Salvar Regras do Contrato'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
