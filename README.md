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

* 🧩 8 Skills especializadas em Markdown


<br>


## 🧩 Skills Disponíveis

<br>

| Skill | Quando é acionada |
|---|---|
| 🗂️ `start-project` | Abrir um repositório desconhecido, auditá-lo e criar ou atualizar o `CLAUDE.md` e o `README.md` a partir de fatos verificados |
| 🔍 `project-classifier` | Classificar o tipo do projeto com base em evidências reais e derivar o fluxo de publicação e as skills que se aplicam |
| 🎨 `elite-web-experience` | Qualquer trabalho de interface web — layout, componentes, CSS, tipografia, acessibilidade, responsividade e animações |
| ☕ `java-clean-architecture` | Backend Java / Kotlin / Spring Boot — fronteiras de Clean Architecture, portas e adaptadores, JPA, transações e semântica REST |
| ✅ `testing` | Definir e executar a estratégia de testes proporcional ao risco da mudança, antes de declarar qualquer trabalho concluído |
| 🎬 `project-video` | Pedido de vídeo de apresentação, demo ou motion graphics — analisa o projeto, destaca as principais ferramentas e renderiza em 4K com Remotion, com GIF para o README |
| 🕵️ `code-review` | Revisar um diff em busca de regressões, falhas de segurança, perda de dados e regras de negócio quebradas |
| 🚀 `release-project` | Preparar e publicar as mudanças — inspeção do diff, numeração sequencial do commit e escolha entre push direto ou Pull Request |


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
               project-classifier project-video release-project start-project testing; do
    mkdir -p ~/.claude/skills/$skill
    cp Claude/$skill.md ~/.claude/skills/$skill/SKILL.md
  done

# Copia os arquivos-modelo que a project-video reaproveita em cada vídeo
$ cp -r Claude/project-video/modelo ~/.claude/skills/project-video/
```


<br>


## 📂 Estrutura do Repositório

<br>

```bash
.
├── CLAUDE.md                     Instruções globais: quando acionar a elite-web-experience
├── code-review.md                Revisão de mudanças e caça a regressões
├── elite-web-experience.md       Web Design, UX/UI, front-end e acessibilidade
├── java-clean-architecture.md    Backend Java e Spring com Clean Architecture
├── project-classifier.md         Classificação do projeto e fluxo de release
├── project-video.md              Vídeo de apresentação em 4K com motion graphics
├── project-video
│   └── modelo                    Síntese de áudio, animações, texto revelado e GIF
├── release-project.md            Commit, push e Pull Request com segurança
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
