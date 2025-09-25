## Estrutura de Código & Modularidade

1. Utilizar boas práticas para projetos next.js
2. Utilizar boas práticas para utilização do mongoose.
3. Nunca ultrapasse 500 linhas por arquivo.
4. Separe funcionalidades em módulos claros e coesos.
5. Use imports ou using relativos consistentes conforme a linguagem e ambiente.
6. Separação de Responsabilidades: Actions isolam a lógica de negócios.
7. Separação de Responsabilidades: Services isolam a lógica de acesso aos dados.
8. Reutilização: Services podem ser usados em outras páginas.
9. Manutenibilidade: Mudanças no banco de dados ficam isoladas nos services.
10. Performance: Queries otimizadas com populate e índices.
11. Tratamento de Erros: Gestão robusta de erros em cada camada. 
12. Database: usar os types e models junto com mongoose para usar mongodb.

## Componetes UX/UI

Estados de loading e error bem definidos.
Use component reutilizavel de Loading que deixe o background bloqueado e esmaecido para utilizar nas chamadas do backend.
Use component reutilizavel de Loading para utilizar no carregamento das páginas.
Use component reutilizavel alert para mostrar avisos dinamicos de erros e sucesso de uma ação do usuário.

### Decisão de UX: Páginas ao invés de Modais
**IMPORTANTE**: Não utilizar modais para formulários de detalhe ou visualização de dados. 
- Modais são inadequados para interfaces complexas e prejudicam a experiência do usuário
- Preferir sempre páginas dedicadas para:
  - Detalhes de contratos
  - Formulários de edição
  - Visualização de dados complexos
  - Qualquer interface que requeira mais espaço ou navegação
- Modais devem ser reservados apenas para confirmações simples e alertas

## Estado Desejado 
* Páginas e Componentes: Serão Server Components por padrão. A diretiva "use client" será usada apenas quando estritamente necessário (ex: componentes com useState, useEffect, ou manipuladores de eventos).
* Busca de Dados (Read): Os Server Components irão buscar dados diretamente (usando await) através da camada de Serviço.
* Mutações de Dados (Create, Update, Delete): Os Client Components (ex: formulários) irão invocar Server Actions para modificar os dados.
* Estrutura de Código:
1. src/components/ ou src/app/: Componentes React (Server e Client).
2. src/actions/: Server Actions que orquestram a lógica de negócio reutilizável em mais de um local (ex: user.actions.ts).
4. Manter actions que é usado em apenas uma página próximo a página (ex: src/services/dashboard/actions/) para logica de negócio usada paenas no dashboard
5. src/services/ ou src/lib/services/: Camada de Serviço com a lógica pura de acesso ao banco (ex: user.service.ts).
6. src/models/: Schemas do Mongoose.
7. src/lib/mongodb.ts: Lógica de conexão com o banco.
8. src/lib: Ulilities e Helpers.
9. src/types: Types e Interfaces.


## Testes & Confiabilidade

* Testabilidade: Cada camada pode ser testada independentemente
* TypeScript: Utilize Jest.
* Casos essenciais: ao menos uso esperado, caso de borda e caso de falha.
* Teste a Camada de Serviço: Crie testes unitários para os serviços. Faça mock da conexão com o banco (mongodb-memory-server) para testar a lógica CRUD de forma isolada.
* Teste a Camada de Actions: Crie testes de integração para as actions. Faça mock das funções da camada de serviço (ex: jest.mock('@/services/userService')) para verificar se as actions chamam os serviços corretos.


## Estilo & Convenções

* Formatação: ESLint, Prettier e uso de tipos estáticos.
* Validação: Zod.

## Observações

* Não crie nada novo, apenas refatore o que já existe, siga o planejamento, 
* Nos Schema não altere as chaves Ids de type: Schema.Types.ObjectId para type: String
* Não remova ref ex: 'ref: 'Tenant', se o arquivo src/types/index.ts existir delete, não use mais ele.* * As interfaces estão disponiveis separadamente na pasta types.

nunca esclua coluans e campos e dados do postgress sem perguntar antes , em hipotese alguma

## Configuração de Ambiente

**REGRA CRÍTICA**: Utilizar APENAS o arquivo `.env` para configurações de ambiente.
- NUNCA criar ou utilizar arquivos `.env.local`, `.env.example`, `.env.development`, etc.
- Todos os arquivos de ambiente alternativos devem ser removidos para evitar conflitos
- O arquivo `.env` é o único ponto de configuração para banco de dados e outras variáveis
- Esta regra previne conflitos entre configurações e garante consistência no ambiente