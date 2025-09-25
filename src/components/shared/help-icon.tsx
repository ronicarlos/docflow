
'use client';
import type { FC } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookCheck, Wrench, Target, AlertTriangle } from 'lucide-react';
import { helpContexts } from '@/lib/help-contexts';
import { cn } from '@/lib/utils';

interface HelpIconProps {
  contextId: keyof typeof helpContexts;
  className?: string;
}

const HelpIcon: FC<HelpIconProps> = ({ contextId, className }) => {
  const content = helpContexts[contextId];

  if (!content) {
    return null; // Or render a disabled icon
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-5 w-5 text-muted-foreground hover:text-primary hover:bg-transparent', className)}
          aria-label="Ajuda"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4" side="right" align="start">
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center gap-2 text-primary">
            <BookCheck className="h-4 w-4" />
            Requisito ISO 9001 Atendido
          </h4>
          <p className="text-sm text-muted-foreground">{content.isoRequirement}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Como Utilizar
          </h4>
          <p className="text-sm text-muted-foreground">{content.howToUse}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center gap-2">
            <Target className="h-4 w-4" />
            Problema que Resolve
          </h4>
          <p className="text-sm text-muted-foreground">{content.problemSolved}</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium leading-none flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            Como Evita Não Conformidade
          </h4>
          <p className="text-sm text-muted-foreground">{content.auditTip}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HelpIcon;
