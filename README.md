<div align="center"> <br> 
  <img align="center" alt="claude-skills" height="150" width="150" src="https://cdn.simpleicons.org/claude" />
</div> 

<br> 

<div align="center">
  Repositório destinado ao armazenamento e organização das minhas Skills do Claude Code, reunindo instruções, padrões e especializações reutilizáveis que definem como o agente deve inspecionar, desenvolver, validar e publicar os meus projetos.
</div> 

 <br> <br> 

## 🚀 Conteúdo do Repositório

* 🧠 1 arquivo de instruções globais (`CLAUDE.md`)

* 🧩 9 Skills especializadas em Markdown

* 🤖 9 Agentes da equipe de vídeos do TikTok


<br>


## 🧩 Skills Disponíveis

<br>

| Skill | Quando é acionada |
|---|---|
| 🗂️ `start-project` | Abrir um repositório desconhecido, auditá-lo e criar ou atualizar o `CLAUDE.md` e o `README.md` a partir de fatos verificados |
| 🔍 `project-classifier` | Classificar o tipo do projeto com base em evidências reais e derivar o fluxo de publicação e as skills que se aplicam |
| 🎨 `elite-web-experience` | Qualquer trabalho de interface web — layout, componentes, CSS, tipografia, acessibilidade, responsividade e animações, inclusive as páginas de erro 404, 403 e de falha geral |
| ☕ `java-clean-architecture` | Backend Java / Kotlin / Spring Boot — fronteiras de Clean Architecture, portas e adaptadores, JPA, transações e semântica REST |
| ✅ `testing` | Definir e executar a estratégia de testes proporcional ao risco da mudança, antes de declarar qualquer trabalho concluído |
| 🎬 `project-video` | Pedido de vídeo de apresentação, demo ou motion graphics — analisa o projeto, destaca as principais ferramentas e renderiza em 4K com Remotion, com GIF para o README |
| 📱 `short-form-video` | Vídeo vertical narrado para TikTok, Reels ou Shorts — roteiro, voz, legendas palavra por palavra e motion graphics em 4K 60 fps, seguindo as correções já feitas e a marca do canal |
| 🕵️ `code-review` | Revisar um diff em busca de regressões, falhas de segurança, perda de dados e regras de negócio quebradas |
| 🚀 `release-project` | Preparar e publicar as mudanças — inspeção do diff, numeração sequencial do commit e escolha entre push direto ou Pull Request |


<br>


## 🤖 Agentes do TikTok

Equipe que produz os vídeos do canal Explica Aí, cada agente responsável por uma etapa. A conversa principal faz o papel de **Produtor**: é a única que fala com o usuário, chama cada agente na ordem certa e só segue para a próxima etapa depois da aprovação dele.

<br>

| Agente | O que faz | Modelo |
|---|---|---|
| 📈 `tiktok-analista-tendencias` | Lista os tópicos em alta no Brasil pelo TikTok Studio e confere se as hashtags do post existem | Sonnet · médio |
| 🔎 `tiktok-pesquisador` | Procura vídeos parecidos no TikTok e anota números, transcrição e o que funcionou | Sonnet · médio |
| ✍️ `tiktok-roteirista` | Escreve o roteiro falado de 1:05 a 1:20, com gancho e palavras de destaque | Opus · alto |
| ✅ `tiktok-verificador` | Pesquisa o tema em fontes confiáveis e confere cada fato do roteiro, com link e data | Opus · alto |
| 🎙️ `tiktok-diretor-voz` | Prepara os textos do ElevenLabs com marcações de emoção e confere os MP3s baixados | Sonnet · médio |
| 💬 `tiktok-legendador` | Monta as legendas palavra por palavra sincronizadas com a narração | Sonnet · médio |
| 🎞️ `tiktok-animador` | Descreve o storyboard e depois constrói as cenas em Remotion | Opus · muito alto (subiu após erros) |
| 🎬 `tiktok-editor` | Prepara o projeto, renderiza o piloto em Full HD e o final em 4K 60 fps | Sonnet · médio |
| 🖼️ `tiktok-designer-capa` | Cria a capa 3:4 em 4K e escreve a descrição do post | Opus · médio |

<br>

Os agentes usam as regras da skill `short-form-video` em vez de copiá-las, então uma correção feita na skill vale para todos.


<br>


## 📖 Instruções Globais

O `CLAUDE.md` define o comportamento padrão para todos os projetos. Um `CLAUDE.md` de projeto é mais específico e prevalece quando houver conflito direto.

<br>

* 🎨 **Interface web sempre passa pela `elite-web-experience`**: a skill é invocada antes de criar ou alterar qualquer interface, de uma página inteira a trocar a cor de um botão.

* 🔎 **O que decide é o resultado, não a descrição do pedido**: corrigir um bug de layout, ajustar um gráfico ou arrumar um alinhamento também contam, porque mudam o que a pessoa vê na tela.

* ⚙️ **Fora da interface, a skill fica de fora**: configuração de build, rotas de API, tipos, mocks de dados, scripts, testes e git.


<br>


## ⚙️ Como Utilizar

Os arquivos aqui ficam na raiz para facilitar a leitura no GitHub. No Claude Code, as instruções globais vivem em `~/.claude/CLAUDE.md` e cada skill em `~/.claude/skills/<nome>/SKILL.md`.

<br>

🔹 Clonagem
```bash
# Clona o repositório
$ git clone https://github.com/ByGustavoo/Claude.git
```

🔹 Instruções globais
```bash
# Copia as instruções globais para o Claude Code
$ cp Claude/CLAUDE.md ~/.claude/CLAUDE.md
```

🔹 Skills
```bash
# Cria a pasta de cada skill e copia o arquivo como SKILL.md
$ for skill in code-review elite-web-experience java-clean-architecture \
               project-classifier project-video release-project short-form-video start-project testing; do
    mkdir -p ~/.claude/skills/$skill
    cp Claude/$skill.md ~/.claude/skills/$skill/SKILL.md
  done

# Copia os arquivos-modelo que a project-video e a short-form-video reaproveitam em cada vídeo
$ cp -r Claude/project-video/modelo ~/.claude/skills/project-video/
$ cp -r Claude/short-form-video/modelo ~/.claude/skills/short-form-video/

# Copia o manual da equipe de agentes e o registro de desempenho de cada um
$ cp Claude/short-form-video/*.md ~/.claude/skills/short-form-video/
```

🔹 Agentes
```bash
# Copia os agentes do TikTok para a pasta de agentes do Claude Code
$ mkdir -p ~/.claude/agents
$ cp Claude/agentes/tiktok/*.md ~/.claude/agents/
```


<br>


## 📂 Estrutura do Repositório

<br>

```bash
.
├── agentes
│   └── tiktok                    9 agentes da equipe de vídeos do TikTok
├── CLAUDE.md                     Instruções globais: quando acionar a elite-web-experience
├── code-review.md                Revisão de mudanças e caça a regressões
├── elite-web-experience.md       Web Design, UX/UI, front-end e acessibilidade
├── java-clean-architecture.md    Backend Java e Spring com Clean Architecture
├── project-classifier.md         Classificação do projeto e fluxo de release
├── project-video.md              Vídeo de apresentação em 4K com motion graphics
├── project-video
│   └── modelo                    Síntese de áudio, animações, texto revelado e GIF
├── release-project.md            Commit, push e Pull Request com segurança
├── short-form-video.md           Vídeo vertical narrado para TikTok, Reels e Shorts
├── short-form-video
│   ├── EQUIPE-DE-AGENTES.md      Etapas de aprovação, pastas e roteiro do Produtor
│   ├── DESEMPENHO-AGENTES.md     Nível de cada agente, falhas e escaladas
│   └── modelo                    iPhone, chat, legendas, voz, revisão e foto de perfil
├── start-project.md              Onboarding em um repositório e documentação
└── testing.md                    Estratégia de testes e validação honesta
```


<br>


## 🔄 Como as Skills se Combinam

Uma skill raramente age sozinha. Uma tarefa de backend costuma percorrer o caminho completo:

<br>

```bash
project-classifier  →  java-clean-architecture  →  testing  →  code-review  →  release-project
```

<br>

A leitura acontece **antes** do trabalho, não depois: a função da skill é moldar a abordagem, e aplicá-la retroativamente significa refazer a tarefa.


<br> 
 
## 🖥️ Desenvolvedor

### 🔵 LinkedIn: [Gustavo Correa](https://www.linkedin.com/in/gustavo-chauar-correa-946168269/)
