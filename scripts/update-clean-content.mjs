import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function main() {
  console.log('1. Logging in to Backoffice...');
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 8090,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  const token = loginRes.data.token;
  console.log('Auth OK, token length:', token ? token.length : 0);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Clean up flexone-pe
  console.log('\n2. Updating flexone-pe...');
  const flxGet = await makeRequest({
    hostname: 'localhost',
    port: 8090,
    path: '/api/v1/sites/flexone-pe',
    method: 'GET',
    headers: authHeaders
  });

  const flxConfig = flxGet.data;
  flxConfig.content = {
    site_id: 'flexone-pe',
    banner_enabled: true,
    banner_text: '⭐ Odoo 20 ya está disponible. Lo mostramos con los datos de tu empresa, sin compromiso.',
    banner_cta_text: 'Pedir demostración',
    banner_cta_url: '/contacto',
    hero_badge: 'Implementador Oficial Odoo Perú',
    hero_title: 'Impulsa tu negocio con un ERP modular',
    hero_subtitle: 'Una implementación pragmática de Odoo ERP — orientada a resultados medibles y adaptada a los procesos operativos de tu empresa en Perú.',
    hero_cta_primary_text: 'Recorre Odoo en 1 minuto',
    hero_cta_primary_url: '/contacto',
    hero_cta_secondary_text: 'Ver Soluciones',
    hero_cta_secondary_url: '/soluciones',
    footer_about: 'Flexone (Flexxoone S.A.C.) es Silver Partner de Odoo en Perú. Especialistas en localización SUNAT, facturación electrónica, libros SIRE y planillas.',
    footer_address: 'Av. Circunvalación del Golf 206, Santiago de Surco, Lima - Perú',
    footer_email: 'contacto@flexone.pe',
    footer_phone: '+51 955 479 055',
    footer_ruc: 'RUC 20601234567',
    footer_copyright: '© 2026 Flexone (Flexxoone S.A.C.). Todos los derechos reservados.'
  };

  const flxPut = await makeRequest({
    hostname: 'localhost',
    port: 8090,
    path: '/api/v1/sites/flexone-pe',
    method: 'PUT',
    headers: authHeaders
  }, flxConfig);
  console.log('flexone-pe updated, status:', flxPut.status);

  // 2. Clean up egs-pe
  console.log('\n3. Updating egs-pe...');
  const egsGet = await makeRequest({
    hostname: 'localhost',
    port: 8090,
    path: '/api/v1/sites/egs-pe',
    method: 'GET',
    headers: authHeaders
  });

  const egsConfig = egsGet.data;
  egsConfig.content = {
    site_id: 'egs-pe',
    banner_enabled: true,
    banner_text: '⭐ EGS SMART ERP con IA y Analítica en tiempo real ya disponible en Perú • +25 años de trayectoria.',
    banner_cta_text: 'Conoce más →',
    banner_cta_url: '/sistemas/smart-erp',
    hero_badge: 'Líderes en Open Source Empresarial & Tributación SUNAT en el Perú',
    hero_title: 'Potencia tu operación con ERP de Clase Mundial, Inteligencia Artificial y Cero Licencias',
    hero_subtitle: 'Más de 25 años implementando iDempiere, EGS SMART ERP y analítica Big Data. Soberanía total de datos, cumplimiento tributario SUNAT (SIRE/PLE) y acompañamiento experto de 100+ consultores.',
    hero_cta_primary_text: 'Solicitar Demostración Gratis',
    hero_cta_primary_url: '/contacto',
    hero_cta_secondary_text: 'Calcular Ahorro de Licencias ↓',
    hero_cta_secondary_url: '#ahorro',
    footer_about: 'Más de 25 años implementando soluciones de código abierto de clase mundial, ERP inteligente y analítica Big Data para empresas en Perú y Latinoamérica.',
    footer_address: 'Edificio Icono 2, Calle 2 de Mayo 516, Miraflores, Lima.',
    footer_email: 'contacto@egs.pe',
    footer_phone: '(01) 746-5413',
    footer_ruc: 'RUC 20509653811',
    footer_copyright: '© 2026 EGS Corporation S.A.C. Todos los derechos reservados.'
  };

  const egsPut = await makeRequest({
    hostname: 'localhost',
    port: 8090,
    path: '/api/v1/sites/egs-pe',
    method: 'PUT',
    headers: authHeaders
  }, egsConfig);
  console.log('egs-pe updated, status:', egsPut.status);

  console.log('\nAll content records updated with clean UTF-8 text successfully!');
}

main().catch(console.error);
