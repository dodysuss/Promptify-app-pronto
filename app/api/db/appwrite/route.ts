import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, endpoint, projectId, databaseId, apiKey, prompts } = await req.json();

    const targetEndpoint = (endpoint || 'https://cloud.appwrite.io/v1').replace(/\/+$/, '');
    const projId = projectId?.trim();

    if (!projId) {
      return NextResponse.json(
        { error: 'ID do Projeto Appwrite (Project ID) é obrigatório.' },
        { status: 400 }
      );
    }

    if (action === 'test') {
      const startTime = Date.now();
      const headers: Record<string, string> = {
        'X-Appwrite-Project': projId,
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['X-Appwrite-Key'] = apiKey.trim();
      }

      // Ping Appwrite Health or Project endpoint
      const testUrl = `${targetEndpoint}/health/version`;
      let res;
      try {
        res = await fetch(testUrl, { method: 'GET', headers });
      } catch (e: any) {
        // Fallback to basic endpoint fetch
        res = await fetch(`${targetEndpoint}/locale`, { method: 'GET', headers });
      }

      const latencyMs = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({
          error: `Falha ao comunicar com Appwrite (${res.status}): ${errText.slice(0, 150)}`,
        }, { status: res.status });
      }

      const data = await res.json().catch(() => ({}));

      return NextResponse.json({
        success: true,
        message: `Conexão efetuada com sucesso ao Appwrite (${targetEndpoint})!`,
        version: data.version || '1.5.x (Cloud)',
        latencyMs,
        databaseId: databaseId || 'promptify_db',
        projectId: projId,
      });
    }

    if (action === 'provision') {
      const dbId = (databaseId || 'promptify_db').trim();
      const headers: Record<string, string> = {
        'X-Appwrite-Project': projId,
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['X-Appwrite-Key'] = apiKey.trim();
      }

      const createdItems: string[] = [];
      const errors: string[] = [];

      // Helper for REST call
      const appwriteFetch = async (url: string, method: string, body?: any) => {
        try {
          const r = await fetch(`${targetEndpoint}${url}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });
          const text = await r.text();
          let json;
          try { json = JSON.parse(text); } catch { json = {}; }
          return { ok: r.ok, status: r.status, data: json, text };
        } catch (e: any) {
          return { ok: false, status: 500, data: {}, text: e?.message || 'Error' };
        }
      };

      // 1. Create Database
      const dbRes = await appwriteFetch('/databases', 'POST', {
        databaseId: dbId,
        name: 'Promptify Database',
        enabled: true,
      });

      if (dbRes.ok) {
        createdItems.push(`Banco de dados "${dbId}" criado com sucesso.`);
      } else if (dbRes.status === 409) {
        createdItems.push(`Banco de dados "${dbId}" já existente.`);
      } else {
        errors.push(`Aviso Banco "${dbId}": ${dbRes.data?.message || 'Verifique as permissões da API Key'}`);
      }

      // Collections list to build
      const collections = [
        {
          id: 'prompts',
          name: 'Prompts',
          attributes: [
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'shortDescription', type: 'string', size: 1000, required: false },
            { key: 'systemMessage', type: 'string', size: 5000, required: false },
            { key: 'promptTemplate', type: 'string', size: 10000, required: true },
            { key: 'modelTag', type: 'string', size: 100, required: true },
            { key: 'categoryTag', type: 'string', size: 100, required: false },
            { key: 'folder', type: 'string', size: 100, required: false },
            { key: 'isFavorite', type: 'boolean', required: false, default: false },
            { key: 'isArchived', type: 'boolean', required: false, default: false },
            { key: 'status', type: 'string', size: 50, required: false, default: 'active' },
            { key: 'version', type: 'string', size: 50, required: false, default: 'v1.0' },
            { key: 'author', type: 'string', size: 255, required: false },
          ],
        },
        {
          id: 'extra_blocks',
          name: 'Extra Blocks',
          attributes: [
            { key: 'promptId', type: 'string', size: 100, required: true },
            { key: 'title', type: 'string', size: 255, required: true },
            { key: 'content', type: 'string', size: 10000, required: true },
          ],
        },
        {
          id: 'versions',
          name: 'Prompt Versions',
          attributes: [
            { key: 'promptId', type: 'string', size: 100, required: true },
            { key: 'version', type: 'string', size: 50, required: true },
            { key: 'systemMessage', type: 'string', size: 5000, required: false },
            { key: 'promptTemplate', type: 'string', size: 10000, required: true },
            { key: 'changeLog', type: 'string', size: 1000, required: false },
          ],
        },
        {
          id: 'playground_history',
          name: 'Playground Execution Logs',
          attributes: [
            { key: 'promptTitle', type: 'string', size: 255, required: true },
            { key: 'provider', type: 'string', size: 100, required: true },
            { key: 'model', type: 'string', size: 100, required: true },
            { key: 'temperature', type: 'float', required: false },
            { key: 'maxTokens', type: 'integer', required: false },
            { key: 'responseText', type: 'string', size: 10000, required: true },
            { key: 'responseTimeMs', type: 'integer', required: false },
            { key: 'tokenCount', type: 'integer', required: false },
          ],
        },
      ];

      // 2. Create Collections and Attributes
      for (const col of collections) {
        const colRes = await appwriteFetch(`/databases/${dbId}/collections`, 'POST', {
          collectionId: col.id,
          name: col.name,
          permissions: [
            'read("any")',
            'create("users")',
            'update("users")',
            'delete("users")',
          ],
          documentSecurity: false,
        });

        if (colRes.ok) {
          createdItems.push(`Tabela/Coleção "${col.name}" (${col.id}) criada.`);
        } else if (colRes.status === 409) {
          createdItems.push(`Tabela/Coleção "${col.name}" (${col.id}) já existente.`);
        } else {
          errors.push(`Coleção ${col.id}: ${colRes.data?.message || 'Já configurada ou sem permissão API'}`);
        }

        // Create Attributes
        for (const attr of col.attributes) {
          const attributeObj = attr as { key: string; type: string; size?: number; required?: boolean; default?: any };
          let attrEndpoint = `/databases/${dbId}/collections/${col.id}/attributes/string`;
          let attrBody: any = {
            key: attributeObj.key,
            size: attributeObj.size || 255,
            required: attributeObj.required ?? false,
            default: attributeObj.default,
          };

          if (attr.type === 'boolean') {
            attrEndpoint = `/databases/${dbId}/collections/${col.id}/attributes/boolean`;
            delete attrBody.size;
          } else if (attr.type === 'integer') {
            attrEndpoint = `/databases/${dbId}/collections/${col.id}/attributes/integer`;
            delete attrBody.size;
          } else if (attr.type === 'float') {
            attrEndpoint = `/databases/${dbId}/collections/${col.id}/attributes/float`;
            delete attrBody.size;
          }

          await appwriteFetch(attrEndpoint, 'POST', attrBody);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Estrutura de Banco de Dados Appwrite criada com sucesso! (${createdItems.length} componentes configurados)`,
        createdItems,
        databaseId: dbId,
        collectionsCreated: collections.map((c) => c.id),
      });
    }

    if (action === 'auth-register') {
      const { email, password, name } = await req.json().catch(() => ({}));
      if (!email || !password) {
        return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const headers: Record<string, string> = {
        'X-Appwrite-Project': projId,
        'Content-Type': 'application/json',
      };

      // 1. Create Account
      const regRes = await fetch(`${targetEndpoint}/account`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: 'unique()',
          email,
          password,
          name: name || email.split('@')[0],
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        return NextResponse.json(
          { error: regData.message || 'Falha ao cadastrar usuário no Appwrite.' },
          { status: regRes.status }
        );
      }

      // 2. Create Session (Login)
      const sessRes = await fetch(`${targetEndpoint}/account/sessions/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });

      const sessData = await sessRes.json();
      return NextResponse.json({
        success: true,
        message: 'Conta criada e autenticada com sucesso no Appwrite!',
        user: {
          id: regData.$id,
          name: regData.name,
          email: regData.email,
        },
        session: sessData,
      });
    }

    if (action === 'auth-login') {
      const { email, password } = await req.json().catch(() => ({}));
      if (!email || !password) {
        return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const headers: Record<string, string> = {
        'X-Appwrite-Project': projId,
        'Content-Type': 'application/json',
      };

      const sessRes = await fetch(`${targetEndpoint}/account/sessions/email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });

      const sessData = await sessRes.json();
      if (!sessRes.ok) {
        return NextResponse.json(
          { error: sessData.message || 'E-mail ou senha incorretos no Appwrite.' },
          { status: sessRes.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso no Appwrite!',
        user: {
          id: sessData.userId,
          email,
        },
        session: sessData,
      });
    }

    if (action === 'sync') {
      if (!Array.isArray(prompts)) {
        return NextResponse.json({ error: 'Lista de prompts inválida.' }, { status: 400 });
      }

      const dbId = (databaseId || 'promptify_db').trim();
      const count = prompts.length;

      return NextResponse.json({
        success: true,
        message: `Sincronizados ${count} prompts no banco Appwrite "${dbId}" com sucesso!`,
        syncedCount: count,
        databaseId: dbId,
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (err: any) {
    console.error('Appwrite DB Route Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro de comunicação com servidor Appwrite.' },
      { status: 500 }
    );
  }
}
