import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isValidPostgresUrl, normalizeConnectionString, sanitizeText } from '@/lib/security-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, connectionString, prompts } = body as Record<string, any>;

    const dbUrl = normalizeConnectionString(typeof connectionString === 'string' ? connectionString : '') || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!isValidPostgresUrl(dbUrl)) {
      return NextResponse.json({ error: 'URL de conexão Neon inválida.' }, { status: 400 });
    }

    if (!dbUrl) {
      return NextResponse.json(
        {
          error:
            'Nenhuma URL de Conexão Neon (PostgreSQL) foi informada. Preencha o campo nas Configurações.',
        },
        { status: 400 }
      );
    }

    const sql = neon(dbUrl);

    if (action === 'test') {
      const startTime = Date.now();
      const result = await sql`SELECT NOW() as current_time, version() as pg_version;`;
      const latency = Date.now() - startTime;

      // Ensure prompts table exists
      await sql`
        CREATE TABLE IF NOT EXISTS promptify_prompts (
          id VARCHAR(100) PRIMARY KEY,
          title TEXT NOT NULL,
          short_description TEXT,
          folder TEXT,
          model_tag VARCHAR(50),
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Get table count
      const countResult = await sql`SELECT COUNT(*) as total FROM promptify_prompts;`;
      const totalInDb = parseInt(countResult[0]?.total || '0', 10);

      return NextResponse.json({
        success: true,
        message: 'Conectado com sucesso ao Banco de Dados Neon (PostgreSQL)!',
        serverTime: result[0]?.current_time,
        version: result[0]?.pg_version,
        latencyMs: latency,
        promptsInDb: totalInDb,
      });
    }

    if (action === 'sync') {
      if (!Array.isArray(prompts)) {
        return NextResponse.json({ error: 'Lista de prompts inválida para sincronização' }, { status: 400 });
      }

      // Ensure table exists
      await sql`
        CREATE TABLE IF NOT EXISTS promptify_prompts (
          id VARCHAR(100) PRIMARY KEY,
          title TEXT NOT NULL,
          short_description TEXT,
          folder TEXT,
          model_tag VARCHAR(50),
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      let syncedCount = 0;
      for (const p of prompts) {
        if (!p.id || !p.title) continue;
        await sql`
          INSERT INTO promptify_prompts (id, title, short_description, folder, model_tag, data, updated_at)
          VALUES (
            ${p.id},
            ${p.title},
            ${p.shortDescription || ''},
            ${p.folder || 'Geral'},
            ${p.modelTag || 'Gemini'},
            ${JSON.stringify(p)},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            short_description = EXCLUDED.short_description,
            folder = EXCLUDED.folder,
            model_tag = EXCLUDED.model_tag,
            data = EXCLUDED.data,
            updated_at = NOW();
        `;
        syncedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `${syncedCount} prompts foram salvos e sincronizados com sucesso no Neon PostgreSQL!`,
        syncedCount,
      });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });
  } catch (err: any) {
    console.error('Neon Database API Error:', err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          'Falha ao conectar com o Neon Database. Verifique se a URL de conexão está correta.',
      },
      { status: 500 }
    );
  }
}
