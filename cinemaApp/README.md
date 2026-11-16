# C!NEMA

Aplicativo Expo/React Native que adapta o catálogo do `cinemaWebsite` para celular:

- Filmes em destaque e catálogos por categoria.
- Detalhes do filme, classificação indicativa, duração e lançamento.
- Consulta de sessões futuras e compra de ingressos.

## Executar

Na pasta `cinemaApp`, rode `npm install` e depois `npx expo start`.

A URL padrão da API é `http://localhost:5172/api`. Para usar Android Emulator, configure antes de iniciar:

```powershell
$env:EXPO_PUBLIC_API_URL="http://10.0.2.2:5172/api"
npx expo start
```

No simulador iOS, `localhost` normalmente funciona. Em um aparelho físico, use o IP local do computador no lugar do host e conecte ambos à mesma rede Wi-Fi.
