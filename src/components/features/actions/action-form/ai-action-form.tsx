'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGenerateActionPlan } from '@/lib/hooks/use-actions';
import { useCompany } from '@/lib/hooks/use-company';
import { ActionFormData } from '@/lib/validators/action';
import { ActionPriority } from '@/lib/types/action';

const aiFormSchema = z.object({
  goal: z.string().min(10, 'Descreva seu objetivo com pelo menos 10 caracteres'),
  companyId: z.string().min(1, 'Selecione uma empresa'),
});

type AIFormData = z.infer<typeof aiFormSchema>;

interface AIActionFormProps {
  onSuggestion: (data: Partial<ActionFormData>) => void;
  onCancel: () => void;
}

export function AIActionForm({ onSuggestion, onCancel }: AIActionFormProps) {
  const { companies, selectedCompany } = useCompany();
  const generateActionPlan = useGenerateActionPlan();

  const form = useForm<AIFormData>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      goal: '',
      companyId: selectedCompany?.id || '',
    },
  });

  const onSubmit = async (data: AIFormData) => {
    try {
      const suggestions = await generateActionPlan.mutateAsync({
        goal: data.goal,
        companyId: data.companyId,
      });

      if (suggestions && suggestions.length > 0) {
        const suggestion = suggestions[0];
        
        // Calculate dates based on estimated duration
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + (suggestion.estimatedDurationDays || 7));

        const formData: Partial<ActionFormData> = {
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority,
          companyId: data.companyId,
          estimatedStartDate: startDate.toISOString().split('T')[0],
          estimatedEndDate: endDate.toISOString().split('T')[0],
          tasks: suggestion.checklistItems.map(item => ({
            description: item,
            isCompleted: false,
          })),
        };

        onSuggestion(formData);
        toast.success('Sugestão gerada com sucesso!');
      } else {
        toast.error('Não foi possível gerar sugestões. Tente novamente com mais detalhes.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar sugestão com IA');
    }
  };

  const isSubmitting = generateActionPlan.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-primary/20">
            <div className="flex items-center gap-2 mb-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-medium">Assistente de Criação com IA</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Descreva seu objetivo e nossa IA irá sugerir um plano de ação completo com tarefas, prazos e prioridade.
            </p>
            
            <div className="space-y-4">
                <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm">Empresa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background h-9 text-sm">
                            <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id} className="text-sm">
                            {company.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-sm">Qual é o seu objetivo?</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ex: Melhorar o engajamento da equipe de vendas em 20% no próximo trimestre..."
                        className="min-h-[120px] bg-background text-sm"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
                />
            </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            size="sm"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
          >
            {isSubmitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Plano com IA
                </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

