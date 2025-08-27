import { supabase } from '@/lib/supabase';
import type {
  ScheduleBlock,
  ScheduleBlockCreate,
  ScheduleBlockUpdate,
  ScheduleBlockFilters,
  ScheduleBlocksResponse,
  ScheduleBlockStats,
  ScheduleBlockValidation,
  ScheduleBlockTemplate,
  ScheduleBlockTemplateCreate,
  ScheduleBlockTemplateUpdate,
  ScheduleBlockConflict
} from '@/types/medical';

class ScheduleBlocksService {
  // ============================================================================
  // SCHEDULE BLOCKS CRUD
  // ============================================================================

  async getScheduleBlocks(filters: ScheduleBlockFilters = {}): Promise<ScheduleBlocksResponse> {
    try {
      let query = supabase
        .from('schedule_blocks')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (filters.doctor_id) {
        query = query.eq('doctor_id', filters.doctor_id);
      }

      if (filters.block_type && filters.block_type.length > 0) {
        query = query.in('block_type', filters.block_type);
      }

      if (filters.start_date) {
        query = query.gte('start_date', filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte('end_date', filters.end_date);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.affects_availability !== undefined) {
        query = query.eq('affects_availability', filters.affects_availability);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Ordenar por data de início
      query = query.order('start_date', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Erro ao buscar bloqueios de agenda: ${error.message}`);
      }

      return {
        data: data || [],
        total: count || 0,
        page: 1,
        per_page: data?.length || 0,
        total_pages: 1
      };
    } catch (error) {
      console.error('Erro no getScheduleBlocks:', error);
      throw error;
    }
  }

  async getScheduleBlockById(id: string): Promise<ScheduleBlock | null> {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Erro ao buscar bloqueio: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no getScheduleBlockById:', error);
      throw error;
    }
  }

  async createScheduleBlock(blockData: ScheduleBlockCreate): Promise<ScheduleBlock> {
    try {
      // Validar antes de criar
      const validation = await this.validateScheduleBlock(blockData);
      if (!validation.is_valid) {
        throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
      }

      const { data, error } = await supabase
        .from('schedule_blocks')
        .insert([{
          ...blockData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar bloqueio: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no createScheduleBlock:', error);
      throw error;
    }
  }

  async updateScheduleBlock(id: string, updates: Partial<ScheduleBlockUpdate>): Promise<ScheduleBlock> {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar bloqueio: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no updateScheduleBlock:', error);
      throw error;
    }
  }

  async deleteScheduleBlock(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao deletar bloqueio: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro no deleteScheduleBlock:', error);
      throw error;
    }
  }

  // ============================================================================
  // SCHEDULE BLOCK TEMPLATES
  // ============================================================================

  async getScheduleBlockTemplates(): Promise<ScheduleBlockTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_block_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw new Error(`Erro ao buscar templates: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro no getScheduleBlockTemplates:', error);
      throw error;
    }
  }

  async createScheduleBlockTemplate(templateData: ScheduleBlockTemplateCreate): Promise<ScheduleBlockTemplate> {
    try {
      const { data, error } = await supabase
        .from('schedule_block_templates')
        .insert([{
          ...templateData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar template: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no createScheduleBlockTemplate:', error);
      throw error;
    }
  }

  async createBlockFromTemplate(templateId: string, doctorId: string, startDate: string, endDate?: string): Promise<ScheduleBlock> {
    try {
      const { data: template, error: templateError } = await supabase
        .from('schedule_block_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) {
        throw new Error(`Erro ao buscar template: ${templateError.message}`);
      }

      const blockData: ScheduleBlockCreate = {
        doctor_id: doctorId,
        title: template.name,
        description: template.description,
        start_date: startDate,
        end_date: endDate || startDate,
        block_type: template.block_type,
        is_all_day: template.is_all_day,
        affects_availability: template.affects_availability,
        recurrence_type: template.recurrence_type || 'none',
        created_by: doctorId, // Assumindo que o médico está criando
        is_active: true
      };

      return await this.createScheduleBlock(blockData);
    } catch (error) {
      console.error('Erro no createBlockFromTemplate:', error);
      throw error;
    }
  }

  // ============================================================================
  // VALIDATION AND CONFLICTS
  // ============================================================================

  async validateScheduleBlock(blockData: ScheduleBlockCreate | ScheduleBlockUpdate): Promise<ScheduleBlockValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: ScheduleBlockConflict[] = [];

    try {
      // Validações básicas
      if (!blockData.title?.trim()) {
        errors.push('Título é obrigatório');
      }

      if (!blockData.start_date) {
        errors.push('Data de início é obrigatória');
      }

      if (!blockData.end_date) {
        errors.push('Data de fim é obrigatória');
      }

      if (blockData.start_date && blockData.end_date) {
        const startDate = new Date(blockData.start_date);
        const endDate = new Date(blockData.end_date);

        if (startDate > endDate) {
          errors.push('Data de início deve ser anterior à data de fim');
        }

        // Verificar se não é muito no passado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          warnings.push('Bloqueio está sendo criado para uma data passada');
        }
      }

      // Verificar conflitos com outros bloqueios
      if (blockData.doctor_id && blockData.start_date && blockData.end_date) {
        const existingBlocks = await this.getScheduleBlocks({
          doctor_id: blockData.doctor_id,
          start_date: blockData.start_date,
          end_date: blockData.end_date,
          is_active: true
        });

        for (const existingBlock of existingBlocks.data) {
          // Pular se for o mesmo bloqueio (no caso de update)
          if ('id' in blockData && existingBlock.id === blockData.id) {
            continue;
          }

          const conflict: ScheduleBlockConflict = {
            type: 'block_overlap',
            message: `Conflito com bloqueio existente: ${existingBlock.title}`,
            conflicting_item: {
              id: existingBlock.id,
              title: existingBlock.title,
              start_date: existingBlock.start_date,
              end_date: existingBlock.end_date
            }
          };
          conflicts.push(conflict);
        }
      }

      return {
        is_valid: errors.length === 0,
        errors,
        warnings,
        conflicts
      };
    } catch (error) {
      console.error('Erro na validação:', error);
      return {
        is_valid: false,
        errors: ['Erro interno na validação'],
        warnings: [],
        conflicts: []
      };
    }
  }

  // ============================================================================
  // STATISTICS AND UTILITIES
  // ============================================================================

  async getScheduleBlockStats(doctorId?: string): Promise<ScheduleBlockStats> {
    try {
      let query = supabase
        .from('schedule_blocks')
        .select('*');

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const blocks = data || [];
      const now = new Date();

      const stats: ScheduleBlockStats = {
        total_blocks: blocks.length,
        active_blocks: blocks.filter(b => b.is_active).length,
        by_type: {
          vacation: 0,
          sick_leave: 0,
          training: 0,
          meeting: 0,
          maintenance: 0,
          personal: 0,
          other: 0
        },
        upcoming_blocks: 0,
        current_blocks: 0,
        total_blocked_hours: 0
      };

      blocks.forEach(block => {
        // Contar por tipo
        stats.by_type[block.block_type]++;

        const startDate = new Date(block.start_date);
        const endDate = new Date(block.end_date);

        // Contar bloqueios atuais e futuros
        if (startDate <= now && endDate >= now) {
          stats.current_blocks++;
        } else if (startDate > now) {
          stats.upcoming_blocks++;
        }

        // Calcular horas bloqueadas
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffHours = diffTime / (1000 * 60 * 60);
        stats.total_blocked_hours += diffHours;
      });

      return stats;
    } catch (error) {
      console.error('Erro no getScheduleBlockStats:', error);
      throw error;
    }
  }

  async getDoctorBlockedDates(doctorId: string, startDate: string, endDate: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_blocks')
        .select('start_date, end_date, is_all_day')
        .eq('doctor_id', doctorId)
        .eq('is_active', true)
        .eq('affects_availability', true)
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      if (error) {
        throw new Error(`Erro ao buscar datas bloqueadas: ${error.message}`);
      }

      const blockedDates: string[] = [];
      
      data?.forEach(block => {
        if (block.is_all_day) {
          const start = new Date(block.start_date);
          const end = new Date(block.end_date);
          
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            blockedDates.push(d.toISOString().split('T')[0]);
          }
        }
      });

      return [...new Set(blockedDates)]; // Remove duplicatas
    } catch (error) {
      console.error('Erro no getDoctorBlockedDates:', error);
      throw error;
    }
  }

  // ============================================================================
  // DEFAULT TEMPLATES
  // ============================================================================

  async initializeDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates: ScheduleBlockTemplateCreate[] = [
        {
          name: 'Férias',
          description: 'Período de férias',
          block_type: 'vacation',
          default_duration_hours: 168, // 1 semana
          is_all_day: true,
          affects_availability: true,
          is_active: true
        },
        {
          name: 'Licença Médica',
          description: 'Afastamento por motivos de saúde',
          block_type: 'sick_leave',
          default_duration_hours: 24,
          is_all_day: true,
          affects_availability: true,
          is_active: true
        },
        {
          name: 'Treinamento',
          description: 'Participação em cursos e treinamentos',
          block_type: 'training',
          default_duration_hours: 8,
          is_all_day: false,
          affects_availability: true,
          is_active: true
        },
        {
          name: 'Reunião',
          description: 'Reuniões administrativas',
          block_type: 'meeting',
          default_duration_hours: 2,
          is_all_day: false,
          affects_availability: true,
          is_active: true
        },
        {
          name: 'Manutenção',
          description: 'Manutenção de equipamentos',
          block_type: 'maintenance',
          default_duration_hours: 4,
          is_all_day: false,
          affects_availability: true,
          is_active: true
        }
      ];

      for (const template of defaultTemplates) {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('schedule_block_templates')
          .select('id')
          .eq('name', template.name)
          .single();

        if (!existing) {
          await this.createScheduleBlockTemplate(template);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar templates padrão:', error);
      // Não propagar o erro para não quebrar a aplicação
    }
  }
}

export const scheduleBlocksService = new ScheduleBlocksService();
export default scheduleBlocksService;