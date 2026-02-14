// NIBAgendas Router - Roteia requisições baseado no path

const API_HOST = 'nibagendas-api.command-systems.workers.dev';

const PAGES_ROUTES = {
  '/administracao': 'nibagendas-adm.pages.dev',
  '/paciente': 'nibagendas-paciente.pages.dev',
  '/medico': 'nibagendas-medico.pages.dev',
  '/documentacao': 'nibagendas-docs.pages.dev'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // === API PROXY ===
    // Todas as requisições /api/* vão para o Worker da API
    if (path.startsWith('/api')) {
      const apiUrl = new URL(request.url);
      apiUrl.hostname = API_HOST;
      apiUrl.pathname = path.replace('/api', '') || '/';
      
      const apiRequest = new Request(apiUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
      });
      
      return fetch(apiRequest);
    }

    // === PAGES PROXY ===
    // Roteia para os diferentes Pages baseado no path
    for (const [routePath, targetHost] of Object.entries(PAGES_ROUTES)) {
      if (path === routePath || path.startsWith(routePath + '/')) {
        // Remove o prefixo da rota do path
        let targetPath = path.replace(routePath, '') || '/';
        
        // Se for um arquivo estático (tem extensão), mantém o path
        // Se não tiver extensão, serve o index.html (SPA)
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(targetPath);
        
        const targetUrl = new URL(request.url);
        targetUrl.hostname = targetHost;
        targetUrl.pathname = targetPath;
        
        const proxyRequest = new Request(targetUrl.toString(), {
          method: request.method,
          headers: request.headers
        });
        
        let response = await fetch(proxyRequest);
        
        // Se não encontrou e não é arquivo estático, tenta servir index.html (SPA routing)
        if (response.status === 404 && !hasExtension) {
          targetUrl.pathname = '/';
          const spaRequest = new Request(targetUrl.toString(), {
            method: 'GET',
            headers: request.headers
          });
          response = await fetch(spaRequest);
        }
        
        // Clona a resposta para poder modificar headers se necessário
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    }

    // === ROOT REDIRECT ===
    // Redireciona a raiz para /administracao
    if (path === '/' || path === '') {
      return Response.redirect(url.origin + '/administracao', 302);
    }

    // === 404 ===
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>404 - Página não encontrada</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #333; }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>404 - Página não encontrada</h1>
          <p>A página que você procura não existe.</p>
          <p><a href="/administracao">Ir para Administração</a></p>
        </body>
      </html>
    `, { 
      status: 404,
      headers: { 'Content-Type': 'text/html' }
    });
  }
};
