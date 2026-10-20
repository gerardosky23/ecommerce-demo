# 🔌 Integración Nativa con el Backoffice Multitenant

Cada sitio generado con `site-craft-pro` queda 100% conectado desde el primer segundo con el Backoffice Multitenant central (`agency-backoffice-go`).

---

## 1. Inyección en `BaseLayout.astro`

En el layout principal, dentro del `<head>`, se inyecta el script universal `embed.js`:

```astro
<!-- Backoffice Universal Embed Script (Contact Rail, WhatsApp QR, Chatwoot, Logo Sync) -->
<script src={`${backofficeUrl}/embed.js?site=${siteSlug}`} defer></script>
```

---

## 2. Etiquetado de Elementos de Marca para Sincronización en Vivo

Para permitir que el cliente o el administrador cambien el logo, favicon o nombre de la empresa desde el Backoffice sin tener que recompilar código:

- **Logo en fondo oscuro (Navbar y Footer):**
  ```html
  <img data-brand="logo" data-brand-variant="dark" src="/images/logo-blanco.png" alt="Logo" />
  ```
- **Logo en fondo claro:**
  ```html
  <img data-brand="logo" data-brand-variant="light" src="/images/logo-negro.png" alt="Logo" />
  ```
- **Nombre de la Empresa en texto:**
  ```html
  <span data-brand="name">Nombre de la Empresa</span>
  ```

---

## 3. Generación del Archivo de Semilla (`backoffice-seed.json`)

Al finalizar la generación del sitio, `site-craft-pro` genera automáticamente un archivo `backoffice-seed.json` en la raíz del nuevo sitio web:

```json
{
  "site_id": "slug-cliente",
  "name": "Nombre Comercial del Cliente",
  "domain": "cliente.com",
  "brand": {
    "site_id": "slug-cliente",
    "logo_light_url": "/images/logo-negro.png",
    "logo_dark_url": "/images/logo-blanco.png",
    "favicon_url": "/favicon.ico",
    "og_image_url": "/images/og-image.png"
  },
  "contact_rail": {
    "site_id": "slug-cliente",
    "enabled": true,
    "phone_label": "+51 987 654 321",
    "phone_tel": "+51987654321",
    "whatsapp_url": "https://wa.me/51987654321?text=Hola,%20consulto%20desde%20el%20sitio%20web",
    "whatsapp_qr_image_url": "/images/whatsapp-qr.png",
    "demo_url": "/contacto",
    "hide_mobile": false,
    "primary_color": "#009ce0",
    "bg_color": "#ffffff",
    "text_color": "#64748b",
    "primary_text_color": "#ffffff"
  },
  "social_sidebar": {
    "site_id": "slug-cliente",
    "enabled": true,
    "hide_mobile": true,
    "twitter_url": "",
    "facebook_url": "",
    "instagram_url": "",
    "youtube_url": "",
    "linkedin_url": "",
    "tiktok_url": ""
  },
  "chatwoot": {
    "site_id": "slug-cliente",
    "enabled": false,
    "base_url": "",
    "website_token": "",
    "has_hmac": false,
    "hide_in_checkout": true
  }
}
```

### Comando para Importar la Semilla al Backoffice:
```bash
curl -X POST http://localhost:8090/api/v1/sites/seed \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d @backoffice-seed.json
```
