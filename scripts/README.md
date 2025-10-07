# Tax Data Scraping & Update System

Este directorio contiene scripts automatizados para mantener actualizados los datos fiscales finlandeses utilizados en la calculadora de salarios.

## 📊 Fuentes de Datos

### 1. Tasas de Impuestos Municipales
- **Fuente**: [Vero.fi - Kuntien tuloveroprosentit](https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/kunnallisvero/)
- **Frecuencia**: Anual (diciembre/enero)
- **Formato**: Tabla HTML con municipios y sus tasas

### 2. Escalas de Impuestos Nacionales
- **Fuente**: [Vero.fi - Tuloveroasteikko](https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tuloveroasteikko/)
- **Frecuencia**: Anual (diciembre/enero)
- **Formato**: Tabla HTML o PDF

### 3. Contribuciones de Pensiones y Seguridad Social
- **Fuente**: [Työeläke.fi](https://www.tyoelake.fi/)
- **Frecuencia**: Anual, verificar a mediados de año
- **Incluye**: TyEL, YEL, seguro de salud, seguro de desempleo

## 🛠️ Scripts Disponibles

### Ejecución Individual
```bash
# Scraping de tasas municipales
npm run scrape:municipal

# Scraping de escalas nacionales
npm run scrape:national

# Scraping de tasas de pensiones
npm run scrape:pension

# Construcción del archivo consolidado
npm run build:tax-data
```

### Ejecución Completa
```bash
# Ejecuta todos los scrapers y construye el archivo final
npm run scrape:all
```

## 📁 Estructura de Archivos

```
scripts/
├── data-updater/
│   ├── scrapeMunicipalRates.ts    # Scraper de tasas municipales
│   ├── scrapeNationalBrackets.ts  # Scraper de escalas nacionales
│   ├── scrapePensionRates.ts      # Scraper de tasas de pensiones
│   └── buildTaxDataFI.ts          # Constructor de archivo consolidado
├── data/
│   ├── municipal-rates.json       # Datos de tasas municipales
│   ├── national-brackets.json     # Datos de escalas nacionales
│   └── pension-rates.json         # Datos de tasas de pensiones
└── README.md                      # Este archivo
```

## 🔄 Proceso de Actualización

### 1. Ejecución Manual (MVP)
```bash
# Ejecutar todos los scrapers
npm run scrape:all

# Verificar los datos generados
cat scripts/data/municipal-rates.json
cat scripts/data/national-brackets.json
cat scripts/data/pension-rates.json

# El archivo consolidado se genera automáticamente en lib/taxDataFI.ts
```

### 2. Verificación de Datos
- Revisar que las tasas estén en rangos razonables
- Verificar que todos los municipios principales estén incluidos
- Comprobar que las escalas de impuestos sean progresivas
- Validar que las contribuciones de pensiones sean consistentes

### 3. Pruebas
```bash
# Ejecutar tests de la calculadora
npm test

# Verificar que la calculadora funcione con los nuevos datos
npm run dev
```

## 🚨 Manejo de Errores

### Fallback de Datos
- Si el scraping falla, los scripts cargan automáticamente los datos del scrape anterior
- Los datos de fallback se almacenan en `scripts/data/`
- Se registra un error pero el proceso continúa

### Validación de Datos
- Las tasas deben estar en rangos razonables (0-1 para decimales)
- Los municipios se normalizan a formato slug
- Las escalas de impuestos deben ser progresivas

### Logging
- Todos los scripts incluyen logging detallado
- Se registran cambios detectados en las tasas
- Se muestran muestras de datos para verificación

## 🔧 Configuración Técnica

### Dependencias
- `axios`: Para hacer peticiones HTTP
- `cheerio`: Para parsing de HTML
- `pdf-parse`: Para parsing de PDFs
- `ts-node`: Para ejecutar TypeScript directamente

### Headers HTTP
Los scrapers incluyen headers realistas para evitar bloqueos:
- User-Agent de Chrome
- Accept headers apropiados
- Idioma finlandés preferido

### Timeouts
- 30 segundos para peticiones HTTP
- Manejo de errores de red
- Reintentos automáticos en caso de fallo

## 📅 Programación de Actualizaciones

### Para Automatización Futura (GitHub Actions)

```yaml
# .github/workflows/update-tax-data.yml
name: Update Tax Data
on:
  schedule:
    - cron: '0 9 1 1 *'  # 1 de enero a las 9:00 AM
  workflow_dispatch:      # Ejecución manual

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run scrape:all
      - run: npm test
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add lib/taxDataFI.ts scripts/data/
          git commit -m "Update tax data for $(date +%Y)" || exit 0
          git push
```

## 🔍 Monitoreo y Alertas

### Verificación de Cambios
Los scripts detectan y registran cambios en las tasas:
- Comparación con datos anteriores
- Alertas para cambios significativos
- Logging de nuevos municipios o brackets

### Métricas de Calidad
- Número de municipios scrapeados
- Número de brackets de impuestos
- Validación de rangos de tasas
- Verificación de progresividad

## 📝 Notas de Mantenimiento

### Actualización de Selectores
Si las páginas web cambian:
1. Actualizar los selectores CSS en los scrapers
2. Probar con `npm run scrape:municipal` (por ejemplo)
3. Verificar que los datos se extraigan correctamente
4. Actualizar este README si es necesario

### Nuevas Fuentes de Datos
Para agregar nuevas fuentes:
1. Crear nuevo scraper en `data-updater/`
2. Agregar script en `package.json`
3. Actualizar `buildTaxDataFI.ts`
4. Documentar en este README

### Troubleshooting
- **Error de red**: Verificar conectividad y headers
- **Datos faltantes**: Revisar selectores CSS
- **Formato incorrecto**: Verificar funciones de parsing
- **Datos inconsistentes**: Revisar validaciones

## 📞 Soporte

Para problemas con el sistema de scraping:
1. Revisar los logs de ejecución
2. Verificar que las fuentes web estén disponibles
3. Probar selectores CSS manualmente
4. Consultar este README para troubleshooting

---

**Última actualización**: ${new Date().toLocaleDateString('fi-FI')}
**Versión**: 1.0.0
